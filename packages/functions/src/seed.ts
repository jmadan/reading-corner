import { dbClient } from "./utils/dbClient";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Table } from "sst/node/table";
import { v4 } from "uuid";

const publishers = [
    {
      "name": "Overreacted",
      "publisherUrl": "https://overreacted.io/",
      "feedUrl": "https://overreacted.io/rss.xml",
      "feedStatus": "inactive",
      "feedType": "xml",
      "primaryTags": "Tech"
    },
    {
      "name": "A List Apart",
      "publisherUrl": "https://alistapart.com/",
      "feedUrl": "https://alistapart.com/main/feed/",
      "feedStatus": "inactive",
      "feedType": "xml",
      "primaryTags": "Tech"
    },
    {
      "name": "Alice GG",
      "publisherUrl": "https://alicegg.tech/",
      "feedUrl": "https://alicegg.tech/feed.xml",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech"
    },
    {
      "name": "VentureBeat",
      "publisherUrl": "https://venturebeat.com/",
      "feedUrl": "http://feeds.feedburner.com/venturebeat/SZYF",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://venturebeat.com/wp-content/themes/vb-news/img/favicon.ico" //https://venturebeat.com/wp-content/themes/vb-news/brand/img/logos/VB_Extended_Logo_40H.png
    },
    {
      "name": "Joel on Software",
      "publisherUrl": "https://www.joelonsoftware.com/",
      "feedUrl": "https://www.joelonsoftware.com/feed/",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://i0.wp.com/www.joelonsoftware.com/wp-content/uploads/2016/12/11969842.jpg?fit=32%2C32&#038;ssl=1"
    },
    {
      "name": "Sam Newman",
      "publisherUrl": "https://samnewman.io/",
      "feedUrl": "https://samnewman.io/blog/feed.xml",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech"
    },
    {
      "name": "Mozilla Hacks",
      "publisherUrl": "https://hacks.mozilla.org/",
      "feedUrl": "https://hacks.mozilla.org/feed/",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech"
    },
    {
      "name": "HACKERNOON",
      "publisherUrl": "https://hackernoon.com/",
      "feedUrl": "https://hackernoon.com/feed",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://hackernoon.com/favicon.ico"
    },
    {
      "name": "TechCrunch",
      "publisherUrl": "https://www.techcrunch.com/",
      "feedUrl": "https://www.techcrunch.com/feed",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png?w=32"
    },
    {
      "name": "Martin Fowler",
      "publisherUrl": "https://martinfowler.com/",
      "feedUrl": "https://martinfowler.com/feed.atom",
      "feedStatus": "active",
      "feedType": "atom",
      "primaryTags": "Tech",
    },
    {
      "name": "DAN NORTH",
      "publisherUrl": "https://dannorth.net/",
      "feedUrl": "https://dannorth.net/blog/index.xml",
      "feedStatus": "inactive",
      "feedType": "xml",
      "primaryTags": "Tech"
    },
    {
      "name": "Coding Horror",
      "publisherUrl": "https://blog.codinghorror.com/",
      "feedUrl": "https://blog.codinghorror.com/rss/",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://blog.codinghorror.com/favicon.png"
    },
    {
      "name": "Jacob Singh",
      "publisherUrl": "https://jacobsingh.name/",
      "feedUrl": "https://jacobsingh.name/rss/",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://jacobsingh.name/favicon.png"
    },
    {
      "name": "Game Developer",
      "publisherUrl": "https://www.gamedeveloper.com/",
      "feedUrl": "https://www.gamedeveloper.com/rss.xml",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://www.gamedeveloper.com/images/GD_official_logo.png"
    },
    {
      "name": "the HUSTLE",
      "publisherUrl": "https://thehustle.co/",
      "feedUrl": "https://thehustle.co/feed/",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://thehustle.co/wp-content/uploads/2022/04/cropped-favicon-32x32.png"
    },
    {
      "name": "Software Engineering Tidbits",
      "publisherUrl": "https://www.softwareengineeringtidbits.com/",
      "feedUrl": "https://www.softwareengineeringtidbits.com/feed",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech"
    },
    {
      "name": "The Pragmatic Engineer",
      "publisherUrl": "https://blog.pragmaticengineer.com/",
      "feedUrl": "https://newsletter.pragmaticengineer.com/feed",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5ecbf7ac-260b-423b-8493-26783bf01f06_600x600.png"
    },
    {
      "name": "Musings Of A Caring Techie",
      "publisherUrl": "https://www.thecaringtechie.com/",
      "feedUrl": "https://www.thecaringtechie.com/feed",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdf5b345b-fff0-4b91-a3d6-9e394fda0510_1280x1280.png"
    },
    {
      "name": "Dev Interrupted",
      "publisherUrl": "https://devinterrupted.com/",
      "feedUrl": "https://devinterrupted.substack.com/feed",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Feff814ba-ca84-4452-a48d-789e87a955bd_750x750.png"
    },
    {
      "name": "The Developing Dev",
      "publisherUrl": "https://www.developing.dev/",
      "feedUrl": "https://www.developing.dev/feed",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb980aa1-65a4-4e90-aacb-fc07a563b5f7_500x500.png"
    },
    {
      "name": "Frontend Engineering",
      "publisherUrl": "https://frontendengineering.substack.com/",
      "feedUrl": "https://frontendengineering.substack.com/feed",
      "feedStatus": "active",
      "feedType": "xml",
      "primaryTags": "Tech",
      "logo": "https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fae9cb9cd-5e76-4b86-9942-7ac5aa9891ea_256x256.png"
    },
    {
      "name": "Financnial Times",
      "publisherUrl": "https://www.ft.com/",
      "feedUrl": "https://www.ft.com/rss/home",
      "feedStatus": "inactive",
      "feedType": "xml",
      "primaryTags": "Business News",
    }
  ];

export async function handler() {

    for (const publisher of publishers) {
        const seedCommand = new PutItemCommand({
            TableName: Table.publisher.tableName,
            Item: {
                id: { S: v4() },
                publisherName: { S: publisher.name },
                feedUrl: { S: publisher.feedUrl },
                feedType: { S: publisher.feedType },
                feedStatus: { S: publisher.feedStatus },
                publisherUrl: { S: publisher.publisherUrl ?? "" },
                logo: { S: publisher.logo ?? "" },
                primaryTags: { S: publisher.primaryTags ?? "" },
            },
        })
        await dbClient.send(seedCommand);
    }

  return {
    statusCode: 201,
    body: JSON.stringify({ status: "successful" }),
  };
}