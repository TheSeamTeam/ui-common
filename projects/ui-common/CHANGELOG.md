# Changelog

## [2.0.1](https://github.com/TheSeamTeam/ui-common/compare/ui-common-v2.0.0...ui-common-v2.0.1) (2026-06-02)


### Bug Fixes

* **quill:** downgrade quill v2.0.3 to v2.0.2 in ui-common project to match repo ([#58](https://github.com/TheSeamTeam/ui-common/issues/58)) ([55a0583](https://github.com/TheSeamTeam/ui-common/commit/55a0583082bf6091a97485aafafa15e966561d55))

## [2.0.0](https://github.com/TheSeamTeam/ui-common/compare/ui-common-v1.0.2...ui-common-v2.0.0) (2026-06-01)


### ⚠ BREAKING CHANGES

* TheSeamLayoutModule has been removed. Apps importing it should remove the import — TheSeamLayoutService is providedIn root and needs no module. Apps using flex-layout directives via the re-export will need their own migration.
* decimalValidator, integerValidator, and phoneLengthValidator are now factories that return ValidatorFn. Update call sites from validator(control) to validator()(control).

### Features

* add framework form utilities and update tests ([#46](https://github.com/TheSeamTeam/ui-common/issues/46)) ([d31d5b9](https://github.com/TheSeamTeam/ui-common/commit/d31d5b9447e93e80e9d5520cbda44a9ad12ec91f))
* copy and test string cleaning utils from app ([#45](https://github.com/TheSeamTeam/ui-common/issues/45)) ([31a1780](https://github.com/TheSeamTeam/ui-common/commit/31a17807ed6af554318e60020881e364a30ee56a))
* **data-filters:** allow overriding filter name for state differentiation ([#44](https://github.com/TheSeamTeam/ui-common/issues/44)) ([2ce808d](https://github.com/TheSeamTeam/ui-common/commit/2ce808dec1a9916da72a4d9fa2c241c788a96aab))
* **datatable:** add CDK test harnesses, comprehensive tests and minor bug fixes ([#39](https://github.com/TheSeamTeam/ui-common/issues/39)) ([40fe07f](https://github.com/TheSeamTeam/ui-common/commit/40fe07f71023665d4f1a1f2877e2d82d7550e650))
* **datatable:** add datatable refresh ([#52](https://github.com/TheSeamTeam/ui-common/issues/52)) ([62f8b94](https://github.com/TheSeamTeam/ui-common/commit/62f8b94dd5b75f743e6e193e0d763f68d7ff28e4))
* **file-input:** add file-input ([#51](https://github.com/TheSeamTeam/ui-common/issues/51)) ([ee3140f](https://github.com/TheSeamTeam/ui-common/commit/ee3140fd0202ea44be41bff709b5fd6c3027f64e))
* **graphql:** improve create sorts mapper with autoMap ([#41](https://github.com/TheSeamTeam/ui-common/issues/41)) ([e45b23b](https://github.com/TheSeamTeam/ui-common/commit/e45b23bfbb574d6bf136178437b8f18b8438b939))
* improve graphql mocking and add new routing animations ([#37](https://github.com/TheSeamTeam/ui-common/issues/37)) ([7214e6a](https://github.com/TheSeamTeam/ui-common/commit/7214e6aebb4679629b13e7d33f4240e5d9fc4efb))
* **progress:** add segmented-progress-bar ([#48](https://github.com/TheSeamTeam/ui-common/issues/48)) ([ff8bddf](https://github.com/TheSeamTeam/ui-common/commit/ff8bddf26c1361a64104b9c77bc68fe2c4269aea))
* **refreshable:** implement new Refreshable util ([#53](https://github.com/TheSeamTeam/ui-common/issues/53)) ([041f0fb](https://github.com/TheSeamTeam/ui-common/commit/041f0fb862cb70bc6469cd611ce12c04ea2d4846))
* **signature-input:** add standalone signature-input entry point ([#50](https://github.com/TheSeamTeam/ui-common/issues/50)) ([3c3cdfc](https://github.com/TheSeamTeam/ui-common/commit/3c3cdfc932af8ba633c7be5bc8e25acc8f2769df))
* **states-counties-map:** add states-counties-map ([#49](https://github.com/TheSeamTeam/ui-common/issues/49)) ([2a92d4c](https://github.com/TheSeamTeam/ui-common/commit/2a92d4c86d32f0cc50d063f3e74b5cc8f98bddec))


### Bug Fixes

* add style to prevent empty gap when widget hidden ([#43](https://github.com/TheSeamTeam/ui-common/issues/43)) ([1cab3df](https://github.com/TheSeamTeam/ui-common/commit/1cab3dfae2845fc01e1bc3e802c98184efec6b0f))
* **datatable-column-preferences:** fix popover styles and active state for column preferences ([#57](https://github.com/TheSeamTeam/ui-common/issues/57)) ([8ef7a5a](https://github.com/TheSeamTeam/ui-common/commit/8ef7a5a198b57bb6aa519ed5b61a5a83e255371a))


### Code Refactoring

* remove @angular/flex-layout dependency ([#47](https://github.com/TheSeamTeam/ui-common/issues/47)) ([19401a5](https://github.com/TheSeamTeam/ui-common/commit/19401a594cdc54d5b27a6ef044f5acb59428dd76))

## [1.0.2](https://github.com/TheSeamTeam/ui-common/compare/ui-common-v1.0.1...ui-common-v1.0.2) (2026-02-25)


### Bug Fixes

* refactor incomplete graphql features ([#34](https://github.com/TheSeamTeam/ui-common/issues/34)) ([fe4fbbd](https://github.com/TheSeamTeam/ui-common/commit/fe4fbbdbb789932ee252fd201b5dfab83151cae3))
* use explicit import path for jest-preset-angular ([889dab8](https://github.com/TheSeamTeam/ui-common/commit/889dab82cef12815652269ab3375215334397c9c))
