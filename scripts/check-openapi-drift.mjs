// fern/openapi.json 이 실제 운영 API 와 갈렸는지 본다.
//
// 이 파일은 제품 저장소 스펙의 **손으로 뜬 사본**이다(MIGRATION_PLAN 3단계 자동화가 아직
// 없다). 사본은 조용히 낡는다 — 실제로 이메일 API 5개가 공개된 지 한참 뒤까지 여기에만
// 없었고, `info.version` 이 양쪽 다 1.3.2 라 눈으로는 갈린 걸 알 수 없었다.
//
// 그래서 버전이 아니라 **경로 집합**을 본다. 비교 대상은 운영 API 가 스스로 내보내는
// /openapi.json 이다 — 배포된 것이 정본이고, 토큰 없이 받을 수 있다.
//
// 배포 순서상 제품이 먼저 나가고 문서가 뒤따르므로, 그 사이 이 검사는 빨간불이 된다.
// 그게 의도다: "문서가 아직 안 따라왔다" 를 사람이 아니라 CI 가 알려 준다.
import { readFileSync } from 'node:fs';

const LIVE = process.env.OPENAPI_URL ?? 'https://api.claw-ops.com/openapi.json';
const LOCAL = new URL('../fern/openapi.json', import.meta.url);

const res = await fetch(LIVE, { signal: AbortSignal.timeout(20_000) });
if (!res.ok) {
  // 운영 API 가 잠깐 안 잡히는 것으로 문서 PR 을 막지는 않는다 — 이 검사의 목적은
  // 드리프트 감지이지 가용성 감시가 아니다.
  console.warn(`⚠ 운영 스펙을 받지 못했습니다 (HTTP ${res.status}) — 검사를 건너뜁니다.`);
  process.exit(0);
}

const live = await res.json();
const local = JSON.parse(readFileSync(LOCAL, 'utf8'));

const livePaths = new Set(Object.keys(live.paths ?? {}));
const localPaths = new Set(Object.keys(local.paths ?? {}));

const missing = [...livePaths].filter((p) => !localPaths.has(p)).sort();
const stale = [...localPaths].filter((p) => !livePaths.has(p)).sort();

if (missing.length === 0 && stale.length === 0) {
  console.log(`✓ OpenAPI 동기화됨 — ${livePaths.size}개 경로`);
  process.exit(0);
}

console.error('✗ fern/openapi.json 이 운영 API 와 갈렸습니다.\n');
if (missing.length) {
  console.error(`문서에 없는 엔드포인트 ${missing.length}개 (운영에는 있음):`);
  for (const p of missing) console.error(`  + ${p}`);
}
if (stale.length) {
  console.error(`\n운영에 없는 엔드포인트 ${stale.length}개 (문서에만 남음):`);
  for (const p of stale) console.error(`  - ${p}`);
}
console.error(
  '\n고치는 법: 제품 저장소에서 `pnpm --filter cpaas-app run spec:bundle` 후\n' +
    '  app/src/swagger/openapi.bundled.json → clawops-docs/fern/openapi.json 으로 복사하세요.',
);
process.exit(1);
