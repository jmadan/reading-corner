import { SQSEvent, SQSRecord } from "aws-lambda";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { dbClient } from "./utils/dbClient";
import { Table } from "sst/node/table";
import fetchRSSFeed from "./utils/fetchRssFeed";
import { formatItem } from "./utils/formatItem";
import { v4 } from "uuid";
import { Queue } from "sst/node/queue";
import { DateTime } from "luxon";
// import { posix } from "path";

const sqs = new SQSClient({
  region: "ap-southeast-2",
});

export async function main(event: SQSEvent) {
  const tableName = Table.bigTable.tableName;
  const records: SQSRecord[] = event.Records;
  console.log('length of records from queue: ', records.length);
  for(const record of records){
    const startTime = Date.now();
    const { id: publisherId, publisher, feedUrl, tag, feedType } = JSON.parse(record.body);
    if(feedType === 'html') {
      console.log(`skipping html feed: ${publisher} with url: ${feedUrl}`);
      break;
    }
    console.log(`starting to process feed: ${publisher} with url: ${feedUrl} --- ${feedType}`);
    const rssItems = await fetchRSSFeed(publisher, feedUrl, feedType);
    for (const item of rssItems) {
      try {
        if(publisher === 'Damien Aicheh' && item.link["@_href"].includes('-fr')){
          continue;
        }
        if(publisher === 'Hacker News' && item.title?.includes('Show HN')) {
          continue;
        }
        if(publisher === "TokyoDev" && item.link['@_href'].includes('story-ja')){
          continue;
        }
        const feedItem = await formatItem(item, publisher, tag);
        await SaveItem(tableName, feedItem, publisherId);
      } catch (err) {
        console.log("feedHandler err........", publisher, feedUrl, err, item.title);
        await ItemToDeadLetterQ(item);
      }
    }
    console.log(`Message processed: ${publisher} with url: ${feedUrl}`);
    const endTime = Date.now();
    console.log(`total time taken: ${endTime - startTime}`)
  }
    
  return {
    statusCode: 200,
    body: JSON.stringify({ status: "successful" }),
  };
}
async function SaveItem(tableName: string, feedItem: any, publisherId: any) {

  const mainTable = Table.bigTable.tableName;

  const putParams = new UpdateItemCommand({
    TableName: tableName,
    Key: {
      pk: feedItem.pk,
      guid: feedItem.guid,
    },
    UpdateExpression: "set #id = :id, #publishedDate = :publishedDate, #title = :title, #link = :link, #author = :author, #keywords = :keywords, #pubDate = :pubDate, #content = :content, #publisher = :publisher, #publisherId = :publisherId, #img = :img, #tag = :tag",
    ExpressionAttributeNames: {
      "#id": "id",
      "#publishedDate": "publishedDate",
      "#title": "title",
      "#link": "link",
      "#author": "author",
      "#keywords": "keywords",
      "#pubDate": "pubDate",
      "#content": "content",
      "#publisher": "publisher",
      "#publisherId": "publisherId",
      "#tag": "tag",
      "#img": "img",
    },
    ExpressionAttributeValues: {
      ":id": { S: v4() },
      ":publishedDate": feedItem.publishedDate,
      ":title": feedItem.title,
      ":link": feedItem.link,
      ":author": feedItem.author,
      ":keywords": feedItem.keywords,
      ":pubDate": feedItem.pubDate,
      ":content": feedItem.content,
      ":publisher": feedItem.publisher,
      ":publisherId": publisherId,
      ":tag": feedItem.tag,
      ":img": feedItem.img ?? '',
    },
    ReturnValues: "ALL_NEW",
  });

   const putParamsForGfeed = new PutItemCommand({
      TableName: mainTable,
      Item: {
        pk: { S: `post#${feedItem.pk.N.toString()}` },
        sk: { S: feedItem.pubDate.N.toString() },
        title: { S: feedItem.title.S },
        content: { S: feedItem.content.S },
        author: { S: feedItem.author.S },
        publisher: { S: feedItem.publisher.S },
        link: { S: feedItem.link.S },
        imgUrl: { S: feedItem.img.S },
        keywords: { S: feedItem.keywords.S },
        publisherId: { S: publisherId.S },
        tag: { S: feedItem.tag.S },
        guid: { S: feedItem.guid.S },
        publishedDate: { S: feedItem.publishedDate.S },
      },
    });
  await dbClient.send(putParamsForGfeed);
}

async function ItemToDeadLetterQ(item: any) {
  const params = {
    MessageBody: JSON.stringify(item),
    QueueUrl: Queue.PostDLQ.queueUrl,
  };
  await sqs.send(new SendMessageCommand(params));
  console.log("Sent message to queue", params);
}

