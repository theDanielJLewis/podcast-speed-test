Test the speed an RSS feed. This is ideal for raw server speed testing, as it loads only the data at the URL, not any of the embeds or links.

## Installation

This script requires Node.js 10.15 or higher. To install:

```shell
git clone https://github.com/theDanielJLewis/test-feed-speed.git
npm i
```

## Example

```shell
node test-feed-speed.js --gzip --runs=5 --chart --test=tap
l: 'Podcast Mirror<br>(508.7 KB / 60.1 KB)',
  url: 'https://feeds.podcastmirror.com/ttZto1k6',
  runResults: [ 336, 341, 347, 363, 542 ],
  runResultsGzip: [ 196, 196, 196, 201, 228 ],
  bytes: 520901,
  bytesGzip: 61578,
  average: 386,
  median: 347,
  averageGzip: 203,
  medianGzip: 196 }
Finished each
Preparing chart...
{ labels:
   [ 'Simplecast<br>(508.6 KB / 60.1 KB)',
     'FeedBurner<br>(514.3 KB / 60.2 KB)',
     'Podcast Mirror<br>(508.7 KB / 60.1 KB)' ],
  averages: [ 361, 457, 386 ],
  medians: [ 339, 379, 347 ],
  averagesGzip: [ 241, 233, 203 ],
  mediansGzip: [ 201, 232, 196 ] }
{ streamstatus: undefined,
  url: 'https://plot.ly/~danieljlewis/12',
  message: '',
  warning: '',
  filename: 'simplecast',
  error: '' }
Xortissimo:test-feed-speed dlewis$ node test-feed-speed.js --gzip --runs=5 --chart --test=tap
Using HTTP/1.1
Testing Liquid Web PowerPress
{ label: 'Liquid Web PowerPress<br>(654.3 KB / 118.7 KB)',
  url: 'https://theaudacitytopodcast.com/feed/podcast/?redirect=no',
  runResults: [ 519, 531, 1178, 1644, 3109 ],
  runResultsGzip: [ 340, 349, 351, 353, 969 ],
  bytes: 670015,
  bytesGzip: 121515,
  average: 1396,
  median: 1178,
  averageGzip: 472,
  medianGzip: 351 }
Testing Flywheel PowerPress
{ label: 'Flywheel PowerPress<br>(654.3 KB / 118.7 KB)',
  url:
   'https://theaudacitytopodcast.flywheelsites.com/feed/podcast/?redirect=no',
  runResults: [ 516, 530, 536, 565, 2811 ],
  runResultsGzip: [ 347, 354, 354, 356, 396 ],
  bytes: 670015,
  bytesGzip: 121515,
  average: 992,
  median: 536,
  averageGzip: 361,
  medianGzip: 354 }
Testing FeedBurner
{ label: 'FeedBurner<br>(654.5 KB / 118.7 KB)',
  url: 'https://feeds.feedburner.com/TheAudacitytoPodcast-mp3',
  runResults: [ 363, 365, 366, 368, 471 ],
  runResultsGzip: [ 218, 224, 231, 238, 369 ],
  bytes: 670158,
  bytesGzip: 121544,
  average: 387,
  median: 366,
  averageGzip: 256,
  medianGzip: 231 }
Testing Podcast Mirror
{ label: 'Podcast Mirror<br>(654.5 KB / 118.7 KB)',
  url: 'https://feeds.podcastmirror.com/theaudacitytopodcast',
  runResults: [ 357, 360, 362, 364, 368 ],
  runResultsGzip: [ 221, 228, 230, 234, 234 ],
  bytes: 670158,
  bytesGzip: 121544,
  average: 362,
  median: 362,
  averageGzip: 229,
  medianGzip: 230 }
Finished each
Preparing chart...
{ labels:
   [ 'Liquid Web PowerPress<br>(654.3 KB / 118.7 KB)',
     'Flywheel PowerPress<br>(654.3 KB / 118.7 KB)',
     'FeedBurner<br>(654.5 KB / 118.7 KB)',
     'Podcast Mirror<br>(654.5 KB / 118.7 KB)' ],
  averages: [ 1396, 992, 387, 362 ],
  medians: [ 1178, 536, 366, 362 ],
  averagesGzip: [ 472, 361, 256, 229 ],
  mediansGzip: [ 351, 354, 231, 230 ] }
{ streamstatus: undefined,
  url: 'https://plot.ly/~danieljlewis/50',
  message: '',
  warning: '',
  filename: 'tap',
  error: '' }
```

## Options

`--runs=[number]` Enter the number of times to run the test on each URL.

`--chart` Output the resulting comparison data to Plotly. This requires a Plotly username and API key (see below).

`--gzip` Run an additional batch of times (same number of times as `--runs`) with gzip compression enabled.

`--test=[name]` Which JSON test to conduct from a `.json` file in the `tests/` folder.

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

## Plotly API

With the `--chart` switch, Test Feed Speed will push the resulting data to Plotly. This requires you get your own account with a username and API key. You may authenticate with their API in either of the following:

1. **Use environment variables**: Run `export plotlyUsername=REPLACE_WITH_USERNAME plotlyApi=REPLACE_WITH_API_KEY` from the terminal before running the script.
2. **Load credentials from JSON file**: save your credentials to `plotly-creds.json` in the project's root folder. 

### `plotly-creds.json` format
```json
{
    "username": "REPLACE_WITH_USERNAME",
    "api": "REPLACE_WITH_API_KEY"
}
```