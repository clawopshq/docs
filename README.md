# ClawOps Documentation

ClawOps의 공개 개발자 문서 저장소입니다. [Fern Docs](https://buildwithfern.com/learn/docs/getting-started/overview/)로 가이드와 OpenAPI 기반 API Reference를 함께 제공합니다.

## 로컬 실행

Node.js 22 이상이 필요합니다.

```bash
npm install
npm run check
npm run dev
```

로컬 미리보기는 기본적으로 `http://localhost:3000`에서 열립니다.

## 저장소 구조

```text
fern/
├── docs.yml              # 내비게이션, 테마, 도메인
├── fern.config.json      # Fern 조직과 CLI 버전
├── generators.yml        # OpenAPI 입력 설정
├── openapi.json          # 배포용 번들 OpenAPI
├── styles.css
└── docs/
    ├── assets/
    └── pages/
```

## 콘텐츠 원칙

- 이 저장소에는 고객에게 공개해도 되는 개발자 문서만 둡니다.
- 내부 설계 문서, 운영 Runbook, 인프라 상세와 미출시 기능은 제품 저장소에 유지합니다.
- API Reference의 원본은 `clawops/app/spec`이며, 이 저장소에는 검증된 번들 결과만 동기화합니다.
- 문서 변경은 Pull Request에서 Fern preview를 확인한 뒤 병합합니다.

## 배포

1. [Fern Dashboard](https://dashboard.buildwithfern.com)에서 `clawops` 조직과 이 GitHub 저장소를 연결합니다.
2. Fern API 키를 GitHub Actions secret `FERN_TOKEN`으로 등록합니다.
3. `main` 브랜치에 병합하면 `.github/workflows/publish-docs.yml`이 문서를 배포합니다.
4. PR에서는 `.github/workflows/preview-docs.yml`이 preview URL을 생성합니다.

## 커스텀 도메인

`fern/docs.yml`에는 다음 값이 미리 설정되어 있습니다.

```yaml
instances:
  - url: clawops.docs.buildwithfern.com
    custom-domain: docs.claw-ops.com
```

Fern Dashboard에서 커스텀 도메인을 등록한 뒤 Fern이 제공하는 CNAME과 TXT 값을 `claw-ops.com` DNS에 추가합니다. Cloudflare를 사용한다면 CNAME은 DNS only로 설정합니다.

## OpenAPI 동기화

초기에는 제품 저장소에서 번들 스펙을 복사합니다.

```bash
cp ../clawops/app/src/swagger/openapi.bundled.json fern/openapi.json
npm run check
```

다음 단계에서 제품 저장소의 API 변경이 이 저장소에 PR을 생성하도록 자동화합니다.
