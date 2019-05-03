Test the speed an RSS feed. This is ideal for raw server speed testing, as it loads only the data at the URL, not any of the embeds or links.

## Installation

This script requires Node.js 10.15 or higher. To install:

```shell
git clone https://github.com/theDanielJLewis/test-feed-speed.git
cd test-feed-speed/
npm i
```

## Example

```shell
node test-feed-speed.js --gzip --runs=5 --chart --test=tap
```

## Options

`--runs=[number]` Enter the number of times to run the test on each URL. Default 10.

`--chart` Chart the resulting averages and medians data to Plotly. This requires a Plotly username and API key (see below). Optionally add value `average` or `median` to chart only that calculation. Default includes both. 

`--gzip` Run an additional batch of times (same number of times as `--runs`) with gzip compression enabled.

`--test=` Which JSON test to conduct from a `.json` file in the `tests/` folder.

`--v` or `--verbose` Display verbose data in the console.

`--label=` Add optional text below each test label for distinguishing test location in output and Plotly charts (when `--chart` is enabled). This is required when using `--append`. Each test can have it's own label, or you can label only the tests you want to append. For example, `--label=Home` will add "Home" to each test label. Then, your remote tests could use `--label=Remote --append` and th new tests with the label "Remote" will be added to the right of your previous test(s). Using this combination, there's no limit to the number of locations you could run the test from and combine on the same chart.

`--append` Used with `--chart`, this will perform the same tests and append them to the existing data with "Remote" appended to the labels. This is intended for testing loading speed from a remote location (like a VPS).

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