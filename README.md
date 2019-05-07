Test the speed an RSS feed and render a chart. This is ideal for raw server speed testing, as it loads only the data at the URL, not any of the embeds or links.

## Installation

This script requires Node.js 10.15 or higher. To install:

```shell
git clone https://github.com/theDanielJLewis/test-feed-speed.git
cd test-feed-speed/
npm i
```

## Run

```shell
npm start
```

And then point your browser to the test's location with port 4000. For example, if running on your local machine, visit `http://localhost:4000`. Replace `localhost` with the IP address of your server if hosting this remotely.

## JSON test formats

Use one of the included test files, or make your own in the following format.

```json
{
    "title": "TITLE OF TEST",
    "file": "OPTIONAL FILENAME FOR PLOTLY TO OVERWRITE",
    "tests": [
        {
            "label": "TEST LABEL 1",
            "url": "TEST_1_FEED_URL"
        },
        {
            "label": "TEST LABEL 2",
            "url": "TEST_2_FEED_URL"
        },
        {
            "label": "TEST LABEL 3",
            "url": "TEST_3_FEED_URL"
        },
        {
            "label": "TEST LABEL 4 (USED FOR BENCHMARK)",
            "url": "TEST_4_FEED_URL"
        }
    ]
}
```