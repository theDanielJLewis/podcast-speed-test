Test the speed an RSS feed. This is ideal for raw server speed testing, as it loads only the data at the URL, not any of the embeds or links.

## Installations

This script requires Node.js 10.15 or higher. To install:

```
$ git clone https://github.com/theDanielJLewis/test-feed-speed.git
$ npm i
```

## Options

`--runs=[number]`   Enter the number of times to run the test on each URL.
`--chart`           Output the resulting comparison data to Plotly. This requires a Plotly username and API key (see below).
`--gzip`            Run an additional batch of times (same number of times as `--runs`) with gzip compression enabled.
`--test=[name]`     Which JSON test to conduct from a `.json` file in the `tests` folder.

