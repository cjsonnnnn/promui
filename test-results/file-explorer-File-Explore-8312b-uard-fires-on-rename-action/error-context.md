# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-explorer.spec.ts >> File Explorer Panel >> Unsaved changes guard >> UC-03 Guard fires on rename action
- Location: tests\e2e\file-explorer.spec.ts:461:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Unsaved changes' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Unsaved changes' })

```

# Page snapshot

```yaml
- generic:
  - generic:
    - generic:
      - generic:
        - generic:
          - img
          - generic:
            - heading [level=1]: Prometheus Config
            - paragraph: Configuration Manager
      - generic:
        - button:
          - img
          - generic: Select theme
        - generic:
          - button:
            - img
            - text: Reload Prometheus
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - img
              - generic: Config Files
            - generic:
              - button:
                - img
              - button:
                - img
              - button:
                - img
          - generic:
            - generic: Config Directory
            - generic: ./configs
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - img
                      - generic:
                        - generic: bug1.yml
                        - generic:
                          - generic: May 2, 09:53 PM
                          - generic: ·
                          - generic: 199 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: bug2-inactive.yml
                        - generic:
                          - generic: Apr 29, 04:15 AM
                          - generic: ·
                          - generic: 78 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: dsqsfsad.yml
                        - generic:
                          - generic: May 2, 09:53 PM
                          - generic: ·
                          - generic: 570 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm01-moohu89s-eb3pvu.yml
                        - generic:
                          - generic: May 2, 10:25 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm01-mooifyvz-qoacc9.yml
                        - generic:
                          - generic: May 2, 10:42 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm01-mooj9bni-843vgt.yml
                        - generic:
                          - generic: May 2, 11:05 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm02-moohuerp-3rvcs3.yml
                        - generic:
                          - generic: May 2, 10:25 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm02-mooig31b-h418o9.yml
                        - generic:
                          - generic: May 2, 10:42 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm02-mooj9ifu-mquaza.yml
                        - generic:
                          - generic: May 2, 11:05 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm07-moohuu0i-o96sht.yml
                        - generic:
                          - generic: May 2, 10:26 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm07-mooigejg-bwyd98.yml
                        - generic:
                          - generic: May 2, 10:42 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm07-mooj9s5c-ksgu7i.yml
                        - generic:
                          - generic: May 2, 11:05 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm09-moohv3yl-bnbh58.yml
                        - generic:
                          - generic: May 2, 10:26 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm09-mooih8so-gm2462.yml
                        - generic:
                          - generic: May 2, 10:43 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm09-mooja2oj-oqt500.yml
                        - generic:
                          - generic: May 2, 11:05 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm11-moohv9we-pih5tt.yml
                        - generic:
                          - generic: May 2, 10:26 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm11-mooihel5-uwx094.yml
                        - generic:
                          - generic: May 2, 10:43 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm11-mooja7es-z3zmni.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm12-moohvdo8-4p7vs0.yml
                        - generic:
                          - generic: May 2, 10:26 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm12-renamed-mooihkd2-914sg1.yml
                        - generic:
                          - generic: May 2, 10:43 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm12-renamed-moojaf3f-tuw5jp.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm13-moohvmv0-jrmtno.yml
                        - generic:
                          - generic: May 2, 10:26 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm13-mooihqpr-zw9s49.yml
                        - generic:
                          - generic: May 2, 10:43 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm13-moojai9s-s67zfc.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm14a-moohwakh-irb7x1.yml
                        - generic:
                          - generic: May 2, 10:27 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm14b-mooihxbh-fxb7yc.yml
                        - generic:
                          - generic: May 2, 10:44 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm14b-moojam60-2mg8x3.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm15-moohwyn8-qp4me9.yml
                        - generic:
                          - generic: May 2, 10:27 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm15-mooii8qk-lx16k5.yml
                        - generic:
                          - generic: May 2, 10:44 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm15-moojavsj-qk0759.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm16-after-moojb289-9fbjml.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm16-moohx39t-wotcuk.yml
                        - generic:
                          - generic: May 2, 10:27 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm16-mooiifrs-yqf29c.yml
                        - generic:
                          - generic: May 2, 10:44 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm17-moohxrak-uqqs1o.yml
                        - generic:
                          - generic: May 2, 10:28 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm17-mooij3sm-z07a78.yml
                        - generic:
                          - generic: May 2, 10:44 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm17-moojb4h9-4s5tb4.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm18-dup-mooijcgi-u8ctey.yml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm18-dup-moojbbfl-niqi02.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm18-moohxxuu-tg44uu.yml
                        - generic:
                          - generic: May 2, 10:28 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm18-mooijair-iebs6m.yml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm18-moojb8ms-0a08c6.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm19-mooijfq8-gro411.yml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm19-moojbd8u-7jal2m.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm20-mooijmo8-ac3tar-copy.yaml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm20-mooijmo8-ac3tar.yml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm20-moojbgt4-t8or0k-copy.yaml
                        - generic:
                          - generic: May 2, 11:07 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm20-moojbgt4-t8or0k.yml
                        - generic:
                          - generic: May 2, 11:07 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm22-mooik2u6-3zoj8v.yml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm22-moojbtis-vjh35k.yml
                        - generic:
                          - generic: May 2, 11:07 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm23-moojbxsi-oqdcsy.yml
                        - generic:
                          - generic: May 2, 11:07 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm25-mooikgel-14bmku.yml
                        - generic:
                          - generic: May 2, 10:46 PM
                          - generic: ·
                          - generic: 31 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm25-moojcn80-pgcok7.yml
                        - generic:
                          - generic: May 2, 11:07 PM
                          - generic: ·
                          - generic: 31 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm27-mooikm60-htsi9i.yml
                        - generic:
                          - generic: May 2, 10:46 PM
                          - generic: ·
                          - generic: 31 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm27-moojcq7m-3iyxvs.yml
                        - generic:
                          - generic: May 2, 11:08 PM
                          - generic: ·
                          - generic: 31 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm30a-moojcvi1-vdjah7.yml
                        - generic:
                          - generic: May 2, 11:08 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm30b-moojcxtv-cyvuz9.yml
                        - generic:
                          - generic: May 2, 11:08 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm30c-moojcz01-j2eo57.yml
                        - generic:
                          - generic: May 2, 11:08 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm31-alt-moojd55f-ng6mbh.yml
                        - generic:
                          - generic: May 2, 11:08 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm31-moojd2aj-vm8p1o.yml
                        - generic:
                          - generic: May 2, 11:08 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm32a-moojd78l-43dwic.yml
                        - generic:
                          - generic: May 2, 11:08 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm32b-moojd78l-eyi3b3.yml
                        - generic:
                          - generic: May 2, 11:08 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm33-moojdcg0-h1vt54.yml
                        - generic:
                          - generic: May 2, 11:08 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: lkfa.yml
                        - generic:
                          - generic: Apr 29, 03:01 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: prometheus-copy.yml
                        - generic:
                          - generic: May 2, 09:53 PM
                          - generic: ·
                          - generic: 20.3 KB
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: prometheus.yml
                        - generic:
                          - generic: Apr 29, 03:03 AM
                          - generic: ·
                          - generic: 19.6 KB
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: sfsd.yml
                        - generic:
                          - generic: Apr 29, 04:43 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: smkoq.yml
                        - generic:
                          - generic: Apr 29, 03:00 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: ssdasqdaasdasd.yml
                        - generic:
                          - generic: May 2, 09:53 PM
                          - generic: ·
                          - generic: 627 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: test-markers.yml
                        - generic:
                          - generic: Apr 29, 05:21 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: test-unsaved.yml
                        - generic:
                          - generic: Apr 29, 03:34 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: test1.yml
                        - generic:
                          - generic: Apr 29, 11:11 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: uc-a-moojdgnc-wypbfk.yml
                        - generic:
                          - generic: May 2, 11:08 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: uc-a-mooje52u-gsf7jj.yml
                        - generic:
                          - generic: May 2, 11:09 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: uc-a-moojeg8k-egkcla.yml
                        - generic:
                          - generic: May 2, 11:09 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: uc-b-mooje7ba-9dmz38.yml
                        - generic:
                          - generic: May 2, 11:09 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: uc-b-moojeigx-tebxps.yml
                        - generic:
                          - generic: May 2, 11:09 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
          - generic:
            - button:
              - img
              - text: New File
      - separator:
        - generic:
          - img
      - generic:
        - generic:
          - generic:
            - generic: Configuration
            - button:
              - img
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - button:
                      - img
                      - generic: Global
                  - generic:
                    - button:
                      - img
                      - generic: Scrape Configs
                  - generic:
                    - button:
                      - img
                      - generic: Rule Files
                  - generic:
                    - button:
                      - img
                      - generic: Alerting / Alertmanagers
                  - generic:
                    - button:
                      - img
                      - generic: Remote Write
                  - generic:
                    - button:
                      - img
                      - generic: Remote Read
                  - generic:
                    - button:
                      - img
                      - generic: Storage
                  - generic:
                    - button:
                      - img
                      - generic: Tracing
      - separator:
        - generic:
          - img
      - generic:
        - generic:
          - generic:
            - generic:
              - generic: Active file
              - generic: uc-a-moojeg8k-egkcla.yml
            - generic:
              - generic:
                - button:
                  - img
                  - text: Stats
            - generic:
              - button:
                - img
                - text: History
                - generic: "1"
            - generic:
              - button: Validate YAML
            - generic:
              - button [disabled]:
                - img
                - text: Save file
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - heading [level=2]: Scrape Configurations
                    - paragraph: 0 jobs · 0 targets
                - generic:
                  - generic:
                    - button:
                      - img
                      - text: Prefix View
                  - generic:
                    - button:
                      - img
                      - text: Add Job
              - generic:
                - generic:
                  - img
                  - textbox:
                    - /placeholder: Search jobs or targets...
                - button:
                  - img
                  - text: Actions
                - button:
                  - img
                  - text: Groups
                - combobox:
                  - generic: All jobs
                  - img
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - img
                      - paragraph: No scrape configs defined
      - separator:
        - generic:
          - img
      - generic:
        - generic:
          - generic:
            - generic:
              - generic:
                - img
                - generic: uc-a-moojeg8k-egkcla.yml
                - generic: 7 lines
              - generic:
                - generic:
                  - button:
                    - img
                - generic:
                  - button:
                    - img
                - generic:
                  - button:
                    - img
                - generic:
                  - button:
                    - img
            - generic:
              - generic:
                - generic:
                  - code:
                    - generic:
                      - textbox
                      - textbox
                      - generic:
                        - generic:
                          - generic:
                            - generic: 
                            - generic: "1"
                          - generic:
                            - generic: "2"
                          - generic:
                            - generic: "3"
                          - generic:
                            - generic: "4"
                          - generic:
                            - generic: "5"
                          - generic:
                            - generic: "6"
                          - generic:
                            - generic: "7"
                      - generic:
                        - generic:
                          - generic:
                            - generic: "global:"
                          - generic:
                            - generic: "scrape_interval: 15s"
                          - generic:
                            - generic: "evaluation_interval: 15s"
                          - generic:
                            - generic: "scrape_configs: []"
                          - generic:
                            - generic: "# unsaved"
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e6] [cursor=pointer]:
    - img [ref=e7]
  - alert
  - dialog "Rename File" [ref=e11]:
    - heading "Rename File" [level=2] [ref=e13]
    - textbox [active] [ref=e15]: uc-a-moojeg8k-egkcla.yml
    - generic [ref=e16]:
      - button "Cancel" [ref=e17]
      - button "Rename" [ref=e18]
    - button "Close" [ref=e19]:
      - img
      - generic [ref=e20]: Close
```

# Test source

```ts
  364 |     const badge = page.locator('text=Config Directory').locator('..').locator('[data-slot="badge"], .font-mono').first()
  365 |     await expect(badge).toBeVisible()
  366 |   })
  367 | 
  368 |   test('FM-30 Rapid file clicks', async ({ page }) => {
  369 |     const a = await createFile(page, uniqueName('fm30a'))
  370 |     const b = await createFile(page, uniqueName('fm30b'))
  371 |     const c = await createFile(page, uniqueName('fm30c'))
  372 |     // Click rapidly without awaiting between.
  373 |     await fileItem(page, a).click()
  374 |     await fileItem(page, b).click()
  375 |     await fileItem(page, c).click()
  376 |     await page.waitForTimeout(800)
  377 |     await expect(fileItem(page, c)).toHaveClass(/bg-accent/)
  378 |   })
  379 | 
  380 |   // ─── Conflict resolution dialog ──────────────────────────────────────────
  381 | 
  382 |   test('FM-31 Conflict dialog — new valid name resolves conflict', async ({ page }) => {
  383 |     const base = uniqueName('fm31')
  384 |     await createFile(page, base)
  385 |     // Trigger conflict by attempting the same name.
  386 |     await page.getByTestId('new-file-btn').click()
  387 |     const dialog = page.getByRole('dialog')
  388 |     await dialog.getByPlaceholder('prometheus').fill(base)
  389 |     await page.getByTestId('create-file-confirm-btn').click()
  390 |     await expect(page.getByRole('heading', { name: 'File already exists' })).toBeVisible()
  391 |     const conflictInput = page.getByRole('dialog').getByRole('textbox')
  392 |     const altBase = uniqueName('fm31-alt')
  393 |     await conflictInput.fill(altBase)
  394 |     await page.getByRole('button', { name: 'Rename file' }).click()
  395 |     await expect(page.getByRole('dialog')).toBeHidden()
  396 |     await expect(fileItem(page, `${altBase}.yml`)).toBeVisible()
  397 |   })
  398 | 
  399 |   test('FM-32 Conflict dialog — entering another existing name', async ({ page }) => {
  400 |     const a = uniqueName('fm32a')
  401 |     const b = uniqueName('fm32b')
  402 |     await createFile(page, a)
  403 |     await createFile(page, b)
  404 |     // Trigger conflict on `a`.
  405 |     await page.getByTestId('new-file-btn').click()
  406 |     const dialog = page.getByRole('dialog')
  407 |     await dialog.getByPlaceholder('prometheus').fill(a)
  408 |     await page.getByTestId('create-file-confirm-btn').click()
  409 |     await expect(page.getByRole('heading', { name: 'File already exists' })).toBeVisible()
  410 |     const conflictInput = page.getByRole('dialog').getByRole('textbox')
  411 |     await conflictInput.fill(b)
  412 |     await page.getByRole('button', { name: 'Rename file' }).click()
  413 |     await expect(page.getByText('That filename also exists')).toBeVisible()
  414 |     await page.getByRole('button', { name: 'Cancel' }).click()
  415 |   })
  416 | 
  417 |   test('FM-33 Duplicate file — cancel', async ({ page }) => {
  418 |     const base = uniqueName('fm33')
  419 |     const filename = await createFile(page, base)
  420 |     await openRowMenu(page, filename, 'Duplicate')
  421 |     const input = page.getByRole('dialog').getByRole('textbox')
  422 |     const initialValue = await input.inputValue()
  423 |     await page.getByRole('button', { name: 'Cancel' }).click()
  424 |     await expect(page.getByRole('dialog')).toBeHidden()
  425 |     // The suggested copy filename was never created.
  426 |     await expect(fileItem(page, initialValue)).toHaveCount(0)
  427 |     await expect(fileItem(page, filename)).toBeVisible()
  428 |   })
  429 | 
  430 |   // ─── Unsaved changes guard (UC) ──────────────────────────────────────────
  431 | 
  432 |   test.describe('Unsaved changes guard', () => {
  433 |     async function setupDirty(page: import('@playwright/test').Page): Promise<{
  434 |       a: string
  435 |       b: string
  436 |     }> {
  437 |       const a = await createFile(page, uniqueName('uc-a'))
  438 |       const b = await createFile(page, uniqueName('uc-b'))
  439 |       await selectFile(page, a)
  440 |       const dirty = await appendInEditor(page, '\n# unsaved')
  441 |       if (!dirty) test.skip(true, 'Monaco not available in this environment')
  442 |       return { a, b }
  443 |     }
  444 | 
  445 |     test('UC-01 Guard fires on file switch', async ({ page }) => {
  446 |       const { a, b } = await setupDirty(page)
  447 |       await fileItem(page, b).click()
  448 |       await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
  449 |       await page.getByTestId('keep-changes-btn').click()
  450 |       // We stayed on `a`.
  451 |       await expect(fileItem(page, a)).toHaveClass(/bg-accent/)
  452 |     })
  453 | 
  454 |     test('UC-02 Guard fires on new file action', async ({ page }) => {
  455 |       await setupDirty(page)
  456 |       await page.getByTestId('new-file-btn').click()
  457 |       await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
  458 |       await page.getByTestId('keep-changes-btn').click()
  459 |     })
  460 | 
  461 |     test('UC-03 Guard fires on rename action', async ({ page }) => {
  462 |       const { a } = await setupDirty(page)
  463 |       await openRowMenu(page, a, 'Rename')
> 464 |       await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
      |                                                                            ^ Error: expect(locator).toBeVisible() failed
  465 |       await page.getByTestId('keep-changes-btn').click()
  466 |     })
  467 | 
  468 |     test('UC-04 Guard fires on duplicate action', async ({ page }) => {
  469 |       const { a } = await setupDirty(page)
  470 |       await openRowMenu(page, a, 'Duplicate')
  471 |       await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
  472 |       await page.getByTestId('keep-changes-btn').click()
  473 |     })
  474 | 
  475 |     test('UC-05 "Keep" — stays on current file', async ({ page }) => {
  476 |       const { a, b } = await setupDirty(page)
  477 |       await fileItem(page, b).click()
  478 |       await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
  479 |       await page.getByTestId('keep-changes-btn').click()
  480 |       await expect(page.getByRole('dialog')).toBeHidden()
  481 |       await expect(fileItem(page, a)).toHaveClass(/bg-accent/)
  482 |     })
  483 | 
  484 |     test('UC-06 "Discard" — proceeds with action', async ({ page }) => {
  485 |       const { a, b } = await setupDirty(page)
  486 |       await fileItem(page, b).click()
  487 |       await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
  488 |       await page.getByTestId('discard-changes-btn').click()
  489 |       await expect(page.getByRole('dialog')).toBeHidden()
  490 |       await expect(fileItem(page, b)).toHaveClass(/bg-accent/)
  491 |       // The originally-active file no longer has the active highlight.
  492 |       await expect(fileItem(page, a)).not.toHaveClass(/bg-accent/)
  493 |     })
  494 | 
  495 |     test('UC-07 No guard with no edits', async ({ page }) => {
  496 |       const a = await createFile(page, uniqueName('uc07-a'))
  497 |       const b = await createFile(page, uniqueName('uc07-b'))
  498 |       await selectFile(page, a)
  499 |       await fileItem(page, b).click()
  500 |       await page.waitForTimeout(400)
  501 |       await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toHaveCount(0)
  502 |       await expect(fileItem(page, b)).toHaveClass(/bg-accent/)
  503 |     })
  504 | 
  505 |     test('UC-08 Guard fires on delete action', async ({ page }) => {
  506 |       const { a } = await setupDirty(page)
  507 |       await openRowMenu(page, a, 'Delete')
  508 |       await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
  509 |       await page.getByTestId('keep-changes-btn').click()
  510 |     })
  511 |   })
  512 | })
  513 | 
```