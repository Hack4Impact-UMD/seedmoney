import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, require = () => ({})) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require });
  return exports;
}
const ranking = load('../src/lib/leaderboardRanking.ts');
const grants = load('../src/components/leaderboard/grantStatOptions.ts');
function fixture() {
  let index = 0;
  const state = [];
  let imageIds;
  const jsx = (type, props) => ({ type, props });
  const { default: Page } = load('../src/components/leaderboard/LeaderboardPage.tsx', (name) => {
    if (name === 'react') return {
      useMemo: (fn) => fn(),
      useRef: (initial) => { const slot = index++; return state[slot] ??= { current: initial }; },
      useState: (initial) => { const slot = index++;
        if (!(slot in state)) state[slot] = initial;
        return [state[slot], (value) => { state[slot] = value; }]; },
    };
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
    if (name.includes('leaderboardRanking')) return ranking;
    if (name.includes('grantStatOptions')) return grants;
    if (name.includes('useReadCampaignImageUrls')) return { default: (ids) => {
      imageIds = ids; return { data: Object.fromEntries(ids.map(id => [id, `image-${id}`])) };
    } };
    return { default: name };
  });
  const data = { campaigns: Array.from({ length: 37 }, (_, index) => ({
    campaignId: 1001 + index, name: `Garden ${index + 1}`, raised: 1000 - index,
    donors: 1, imageUrl: null, projectCategory: index % 2 ? 'Farm' : 'School',
  })), specialGrantCampaignIds: { strongStart: null, strongFinish: null, geographicInterest: null },
  totalCampaigns: 37, totalRaised: 99999, totalDonors: 200, gardenCategories: ['Farm', 'School'] };
  return { data, render: () => { index = 0; return Page({ data }); }, get imageIds() { return imageIds; } };
}
function find(node, suffix) {
  if (!node || typeof node !== 'object') return null;
  if (typeof node.type === 'string' && node.type.endsWith(suffix)) return node;
  for (const child of Object.values(node)) {
    for (const item of Array.isArray(child) ? child : [child]) {
      const match = find(item, suffix); if (match) return match;
    }
  }
  return null;
}
const grid = (tree) => find(tree, 'LeaderboardGrid').props.campaigns;
const pager = (tree) => find(tree, '/Pagination');
const filters = (tree) => find(tree, 'LeaderboardFilters').props;

test('renders and requests images for at most 12 campaigns while keeping global ranks', () => {
  const f = fixture();
  let tree = f.render();
  assert.equal(grid(tree).length, 12);
  assert.equal(f.imageIds.length, 12);
  assert.equal(pager(tree).props.count, 4);
  assert.equal(grid(tree)[0].imageUrl, 'image-1001');
  pager(tree).props.onChange(null, 2);
  tree = f.render();
  assert.equal(grid(tree)[0].displayRank, 13);
  assert.equal(f.imageIds[0], 1013);
  pager(tree).props.onChange(null, 4);
  tree = f.render();
  assert.equal(grid(tree).length, 1);
  assert.equal(grid(tree)[0].displayRank, 37);
});

test('search, category, sorting and grant filters reset pagination without reranking', () => {
  const f = fixture();
  for (const apply of [
    props => props.onSearchChange('Garden 37'),
    props => props.onGardenChange('School'),
    props => props.onSortChange('leastRaised'),
    props => props.onGrantSelect('grant600'),
  ]) {
    pager(f.render())?.props.onChange(null, 3);
    apply(filters(f.render()));
    const tree = f.render();
    assert.equal(pager(tree)?.props.page ?? 1, 1);
    assert.ok(grid(tree).length <= 12);
    filters(tree).onSearchChange('');
    filters(f.render()).onGardenChange('all');
    filters(f.render()).onSortChange('mostRaised');
    // Open and close the grant chip to clear its filter.
    filters(f.render()).onGrantChipClick();
    filters(f.render()).onGrantChipClick();
  }
  filters(f.render()).onSearchChange('Garden 37');
  assert.equal(grid(f.render())[0].displayRank, 37);
});

test('shrinking or empty data cannot leave the user on a blank out-of-range page', () => {
  const f = fixture();
  pager(f.render()).props.onChange(null, 4);
  f.data.campaigns = f.data.campaigns.slice(0, 2);
  assert.equal(grid(f.render()).length, 2);
  assert.equal(pager(f.render()), null);
  f.data.campaigns = [];
  const tree = f.render();
  assert.equal(find(tree, 'LeaderboardGrid'), null);
  assert.equal(f.imageIds.length, 0);
});
