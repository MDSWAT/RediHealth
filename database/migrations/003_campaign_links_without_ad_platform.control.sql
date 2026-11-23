-- Ad-platform numbers (reach, impressions, link clicks) are not used: no ad platform is connected.
ALTER TABLE campaign_links
  DROP COLUMN IF EXISTS reach,
  DROP COLUMN IF EXISTS impressions,
  DROP COLUMN IF EXISTS link_clicks;
