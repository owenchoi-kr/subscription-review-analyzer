#!/usr/bin/env node

const gplay = require('google-play-scraper').default;
const store = require('app-store-scraper');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

function getFlag(flag, defaultVal) {
  const idx = args.indexOf(flag);
  if (idx === -1) return defaultVal;
  return args[idx + 1];
}

function hasFlag(flag) {
  return args.includes(flag);
}

async function searchApps(term) {
  console.log(`\nSearching for "${term}"...\n`);

  const [playResults, iosResults] = await Promise.all([
    gplay.search({ term, num: 5 }).catch(() => []),
    store.search({ term, num: 5, country: 'us' }).catch(() => [])
  ]);

  if (playResults.length > 0) {
    console.log('=== Google Play ===');
    playResults.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title}`);
      console.log(`     ID: ${r.appId}`);
      console.log(`     Rating: ${r.score?.toFixed(1) || 'N/A'} | ${r.developer}`);
      console.log();
    });
  }

  if (iosResults.length > 0) {
    console.log('=== App Store (US) ===');
    iosResults.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title}`);
      console.log(`     ID: ${r.id} (bundle: ${r.appId})`);
      console.log(`     Rating: ${r.score?.toFixed(1) || 'N/A'} | ${r.developer}`);
      console.log();
    });
  }
}

async function fetchReviews(playId) {
  const iosId = getFlag('--ios', null);
  const num = parseInt(getFlag('--num', '500'), 10);
  const maxRating = parseInt(getFlag('--rating', '5'), 10);
  const months = parseInt(getFlag('--months', '0'), 10);
  const platform = getFlag('--platform', 'both');
  const country = getFlag('--country', 'us');

  const cutoffDate = months > 0
    ? new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000)
    : null;

  function isWithinDateRange(dateStr) {
    if (!cutoffDate || !dateStr) return true;
    return new Date(dateStr) >= cutoffDate;
  }

  const allReviews = [];

  if (platform === 'both' || platform === 'android') {
    console.log(`\nFetching Google Play reviews for ${playId}...`);
    try {
      let nextToken = undefined;
      const maxPages = Math.ceil(num / 150);
      for (let page = 0; page < maxPages; page++) {
        const androidCount = allReviews.filter(r => r.platform === 'android').length;
        if (androidCount >= num) break;
        const result = await gplay.reviews({
          appId: playId,
          num: Math.min(150, num - androidCount),
          sort: gplay.sort.NEWEST,
          paginate: true,
          nextPaginationToken: nextToken
        });
        const batch = result.data
          .filter(r => r.score <= maxRating)
          .filter(r => isWithinDateRange(r.date))
          .map(r => ({
            platform: 'android',
            score: r.score,
            title: '',
            text: r.text || '',
            date: r.date,
            thumbsUp: r.thumbsUp || 0
          }));
        allReviews.push(...batch);
        nextToken = result.nextPaginationToken;
        if (!nextToken) break;
        // If we got reviews older than cutoff, stop paginating
        if (cutoffDate && result.data.length > 0) {
          const oldest = new Date(result.data[result.data.length - 1].date);
          if (oldest < cutoffDate) break;
        }
      }
      const androidTotal = allReviews.filter(r => r.platform === 'android').length;
      console.log(`  -> ${androidTotal} Android reviews (rating <= ${maxRating}${cutoffDate ? `, last ${months}mo` : ''})`);
    } catch (err) {
      console.error(`  Android error: ${err.message}`);
    }
  }

  if ((platform === 'both' || platform === 'ios') && iosId) {
    console.log(`\nFetching App Store reviews for ${iosId}...`);
    try {
      const iosIdNum = parseInt(iosId, 10);
      const isNumericId = !isNaN(iosIdNum);
      const query = isNumericId ? { id: iosIdNum } : { appId: iosId };

      let iosReviews = [];
      const maxPages = Math.ceil(num / 50);
      for (let page = 1; page <= maxPages; page++) {
        const results = await store.reviews({
          ...query,
          country,
          sort: store.sort.RECENT,
          page
        });
        if (!results || results.length === 0) break;
        iosReviews.push(...results);
        if (iosReviews.length >= num) break;
        // If oldest review is beyond cutoff, stop
        if (cutoffDate && results.length > 0) {
          const oldest = new Date(results[results.length - 1].updated || results[results.length - 1].date);
          if (oldest < cutoffDate) break;
        }
      }

      const filtered = iosReviews
        .filter(r => r.score <= maxRating)
        .filter(r => isWithinDateRange(r.updated || r.date))
        .map(r => ({
          platform: 'ios',
          score: r.score,
          title: r.title || '',
          text: r.text || '',
          date: r.updated || r.date || '',
          thumbsUp: 0
        }));
      allReviews.push(...filtered);
      console.log(`  -> ${filtered.length} iOS reviews (rating <= ${maxRating}${cutoffDate ? `, last ${months}mo` : ''})`);
    } catch (err) {
      console.error(`  iOS error: ${err.message}`);
    }
  }

  if ((platform === 'both' || platform === 'ios') && !iosId) {
    console.log('\n  Skipping iOS (no --ios flag provided)');
  }

  // Fallback: if fewer than 30 reviews with time filter, retry without it
  const MIN_REVIEWS = 30;
  if (cutoffDate && allReviews.length < MIN_REVIEWS) {
    console.log(`\n⚠ Only ${allReviews.length} reviews in last ${months} months (minimum: ${MIN_REVIEWS}).`);
    console.log(`  Expanding to all-time reviews...`);

    allReviews.length = 0; // clear

    if (platform === 'both' || platform === 'android') {
      try {
        let nextToken = undefined;
        const maxPages = Math.ceil(num / 150);
        for (let page = 0; page < maxPages; page++) {
          const androidCount = allReviews.filter(r => r.platform === 'android').length;
          if (androidCount >= num) break;
          const result = await gplay.reviews({
            appId: playId,
            num: Math.min(150, num - androidCount),
            sort: gplay.sort.NEWEST,
            paginate: true,
            nextPaginationToken: nextToken
          });
          const batch = result.data
            .filter(r => r.score <= maxRating)
            .map(r => ({
              platform: 'android',
              score: r.score,
              title: '',
              text: r.text || '',
              date: r.date,
              thumbsUp: r.thumbsUp || 0
            }));
          allReviews.push(...batch);
          nextToken = result.nextPaginationToken;
          if (!nextToken) break;
        }
        console.log(`  -> ${allReviews.filter(r => r.platform === 'android').length} Android reviews (all-time)`);
      } catch (err) {
        console.error(`  Android error: ${err.message}`);
      }
    }

    if ((platform === 'both' || platform === 'ios') && iosId) {
      try {
        const iosIdNum = parseInt(iosId, 10);
        const isNumericId = !isNaN(iosIdNum);
        const query = isNumericId ? { id: iosIdNum } : { appId: iosId };
        let iosReviews = [];
        const maxPages = Math.ceil(num / 50);
        for (let page = 1; page <= maxPages; page++) {
          const results = await store.reviews({
            ...query,
            country,
            sort: store.sort.RECENT,
            page
          });
          if (!results || results.length === 0) break;
          iosReviews.push(...results);
          if (iosReviews.length >= num) break;
        }
        const filtered = iosReviews
          .filter(r => r.score <= maxRating)
          .map(r => ({
            platform: 'ios',
            score: r.score,
            title: r.title || '',
            text: r.text || '',
            date: r.updated || r.date || '',
            thumbsUp: 0
          }));
        allReviews.push(...filtered);
        console.log(`  -> ${filtered.length} iOS reviews (all-time)`);
      } catch (err) {
        console.error(`  iOS error: ${err.message}`);
      }
    }

    console.log(`  ✓ Expanded to ${allReviews.length} total reviews.`);
  }

  const outputFile = getFlag('--output', `reviews_${playId.split('.').pop()}.json`);
  const outputPath = path.resolve(outputFile);

  const output = {
    appId: { play: playId, ios: iosId },
    fetchDate: new Date().toISOString(),
    filters: { maxRating, platform, country, requested: num, months: months || 'all' },
    totalFetched: allReviews.length,
    reviews: allReviews
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved ${allReviews.length} reviews to ${outputPath}`);
  return output;
}

function printUsage() {
  console.log(`
Usage:
  node fetch_reviews.js search "app name"
  node fetch_reviews.js fetch <playStoreId> [options]

Options:
  --ios <iosId>        iOS app ID (numeric or bundle ID)
  --num <number>       Reviews per platform (default: 500)
  --rating <max>       Max star rating to include (default: 5 = all)
  --months <n>         Only include reviews from the last N months (default: 0 = all)
  --platform <p>       android | ios | both (default: both)
  --country <code>     Country code (default: us)
  --output <file>      Output filename (default: reviews_<appname>.json)

Examples:
  # Fetch all reviews from both stores
  node fetch_reviews.js fetch com.example.app --ios 123456789

  # Fetch last 6 months, all ratings, max 500 per platform
  node fetch_reviews.js fetch com.example.app --ios 123456789 --months 6

  # Fetch only 1-3 star reviews from last 3 months
  node fetch_reviews.js fetch com.example.app --ios 123456789 --rating 3 --months 3
`);
}

async function main() {
  if (!command) {
    printUsage();
    process.exit(1);
  }

  if (command === 'search') {
    const term = args.slice(1).join(' ');
    if (!term) {
      console.error('Please provide a search term');
      process.exit(1);
    }
    await searchApps(term);
  } else if (command === 'fetch') {
    const playId = args[1];
    if (!playId) {
      console.error('Please provide a Play Store app ID');
      process.exit(1);
    }
    await fetchReviews(playId);
  } else {
    printUsage();
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
