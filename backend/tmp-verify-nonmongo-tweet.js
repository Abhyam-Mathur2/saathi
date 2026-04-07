const fetch = global.fetch;

(async () => {
  const res = await fetch('http://localhost:5000/api/reports/demo-123/generate-tweet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      report: {
        _id: 'demo-123',
        issueType: 'Infrastructure',
        urgency: 8,
        status: 'Pending',
        description: 'Large pothole near school entrance causing accidents.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: { address: 'Rohini Sector 15, Delhi', coordinates: [77.1025, 28.7041] }
      }
    })
  });

  const data = await res.json();
  console.log(JSON.stringify({ status: res.status, success: data.success, tweet: data?.data?.tweet, length: data?.data?.tweet?.length }, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
