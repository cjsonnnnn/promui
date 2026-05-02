# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-explorer.spec.ts >> File Explorer Panel >> FM-14 Rename file — rename to existing name
- Location: tests\e2e\file-explorer.spec.ts:163:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/already exists|exists/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/already exists|exists/i).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - img [ref=e6]
        - generic [ref=e7]:
          - heading "Prometheus Config" [level=1] [ref=e8]
          - paragraph [ref=e9]: Configuration Manager
      - generic [ref=e10]:
        - button "Select theme" [ref=e11]:
          - img
          - generic [ref=e12]: Select theme
        - button "Reload Prometheus" [ref=e14]:
          - img
          - text: Reload Prometheus
    - generic [ref=e15]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - img [ref=e20]
            - generic [ref=e22]: Config Files
          - generic [ref=e23]:
            - button [ref=e24]:
              - img
            - button [ref=e25]:
              - img
            - button [ref=e26]:
              - img
        - generic [ref=e27]:
          - generic [ref=e28]: Config Directory
          - generic [ref=e29]: ./configs
        - generic [ref=e34]:
          - generic [ref=e35] [cursor=pointer]:
            - img [ref=e36]
            - generic [ref=e39]:
              - generic [ref=e40]: bug1.yml
              - generic [ref=e41]:
                - generic [ref=e42]: May 2, 09:53 PM
                - generic [ref=e43]: ·
                - generic [ref=e44]: 199 B
            - button [ref=e45]:
              - img
          - generic [ref=e46] [cursor=pointer]:
            - img [ref=e47]
            - generic [ref=e50]:
              - generic [ref=e51]: bug2-inactive.yml
              - generic [ref=e52]:
                - generic [ref=e53]: Apr 29, 04:15 AM
                - generic [ref=e54]: ·
                - generic [ref=e55]: 78 B
            - button [ref=e56]:
              - img
          - generic [ref=e57] [cursor=pointer]:
            - img [ref=e58]
            - generic [ref=e61]:
              - generic [ref=e62]: dsqsfsad.yml
              - generic [ref=e63]:
                - generic [ref=e64]: May 2, 09:53 PM
                - generic [ref=e65]: ·
                - generic [ref=e66]: 570 B
            - button [ref=e67]:
              - img
          - generic [ref=e68] [cursor=pointer]:
            - img [ref=e69]
            - generic [ref=e72]:
              - generic [ref=e73]: fm01-moohu89s-eb3pvu.yml
              - generic [ref=e74]:
                - generic [ref=e75]: May 2, 10:25 PM
                - generic [ref=e76]: ·
                - generic [ref=e77]: 92 B
            - button [ref=e78]:
              - img
          - generic [ref=e79] [cursor=pointer]:
            - img [ref=e80]
            - generic [ref=e83]:
              - generic [ref=e84]: fm01-mooifyvz-qoacc9.yml
              - generic [ref=e85]:
                - generic [ref=e86]: May 2, 10:42 PM
                - generic [ref=e87]: ·
                - generic [ref=e88]: 92 B
            - button [ref=e89]:
              - img
          - generic [ref=e90] [cursor=pointer]:
            - img [ref=e91]
            - generic [ref=e94]:
              - generic [ref=e95]: fm01-mooj9bni-843vgt.yml
              - generic [ref=e96]:
                - generic [ref=e97]: May 2, 11:05 PM
                - generic [ref=e98]: ·
                - generic [ref=e99]: 92 B
            - button [ref=e100]:
              - img
          - generic [ref=e101] [cursor=pointer]:
            - img [ref=e102]
            - generic [ref=e105]:
              - generic [ref=e106]: fm02-moohuerp-3rvcs3.yml
              - generic [ref=e107]:
                - generic [ref=e108]: May 2, 10:25 PM
                - generic [ref=e109]: ·
                - generic [ref=e110]: 92 B
            - button [ref=e111]:
              - img
          - generic [ref=e112] [cursor=pointer]:
            - img [ref=e113]
            - generic [ref=e116]:
              - generic [ref=e117]: fm02-mooig31b-h418o9.yml
              - generic [ref=e118]:
                - generic [ref=e119]: May 2, 10:42 PM
                - generic [ref=e120]: ·
                - generic [ref=e121]: 92 B
            - button [ref=e122]:
              - img
          - generic [ref=e123] [cursor=pointer]:
            - img [ref=e124]
            - generic [ref=e127]:
              - generic [ref=e128]: fm02-mooj9ifu-mquaza.yml
              - generic [ref=e129]:
                - generic [ref=e130]: May 2, 11:05 PM
                - generic [ref=e131]: ·
                - generic [ref=e132]: 92 B
            - button [ref=e133]:
              - img
          - generic [ref=e134] [cursor=pointer]:
            - img [ref=e135]
            - generic [ref=e138]:
              - generic [ref=e139]: fm07-moohuu0i-o96sht.yml
              - generic [ref=e140]:
                - generic [ref=e141]: May 2, 10:26 PM
                - generic [ref=e142]: ·
                - generic [ref=e143]: 92 B
            - button [ref=e144]:
              - img
          - generic [ref=e145] [cursor=pointer]:
            - img [ref=e146]
            - generic [ref=e149]:
              - generic [ref=e150]: fm07-mooigejg-bwyd98.yml
              - generic [ref=e151]:
                - generic [ref=e152]: May 2, 10:42 PM
                - generic [ref=e153]: ·
                - generic [ref=e154]: 92 B
            - button [ref=e155]:
              - img
          - generic [ref=e156] [cursor=pointer]:
            - img [ref=e157]
            - generic [ref=e160]:
              - generic [ref=e161]: fm07-mooj9s5c-ksgu7i.yml
              - generic [ref=e162]:
                - generic [ref=e163]: May 2, 11:05 PM
                - generic [ref=e164]: ·
                - generic [ref=e165]: 92 B
            - button [ref=e166]:
              - img
          - generic [ref=e167] [cursor=pointer]:
            - img [ref=e168]
            - generic [ref=e171]:
              - generic [ref=e172]: fm09-moohv3yl-bnbh58.yml
              - generic [ref=e173]:
                - generic [ref=e174]: May 2, 10:26 PM
                - generic [ref=e175]: ·
                - generic [ref=e176]: 92 B
            - button [ref=e177]:
              - img
          - generic [ref=e178] [cursor=pointer]:
            - img [ref=e179]
            - generic [ref=e182]:
              - generic [ref=e183]: fm09-mooih8so-gm2462.yml
              - generic [ref=e184]:
                - generic [ref=e185]: May 2, 10:43 PM
                - generic [ref=e186]: ·
                - generic [ref=e187]: 92 B
            - button [ref=e188]:
              - img
          - generic [ref=e189] [cursor=pointer]:
            - img [ref=e190]
            - generic [ref=e193]:
              - generic [ref=e194]: fm09-mooja2oj-oqt500.yml
              - generic [ref=e195]:
                - generic [ref=e196]: May 2, 11:05 PM
                - generic [ref=e197]: ·
                - generic [ref=e198]: 92 B
            - button [ref=e199]:
              - img
          - generic [ref=e200] [cursor=pointer]:
            - img [ref=e201]
            - generic [ref=e204]:
              - generic [ref=e205]: fm11-moohv9we-pih5tt.yml
              - generic [ref=e206]:
                - generic [ref=e207]: May 2, 10:26 PM
                - generic [ref=e208]: ·
                - generic [ref=e209]: 92 B
            - button [ref=e210]:
              - img
          - generic [ref=e211] [cursor=pointer]:
            - img [ref=e212]
            - generic [ref=e215]:
              - generic [ref=e216]: fm11-mooihel5-uwx094.yml
              - generic [ref=e217]:
                - generic [ref=e218]: May 2, 10:43 PM
                - generic [ref=e219]: ·
                - generic [ref=e220]: 92 B
            - button [ref=e221]:
              - img
          - generic [ref=e222] [cursor=pointer]:
            - img [ref=e223]
            - generic [ref=e226]:
              - generic [ref=e227]: fm11-mooja7es-z3zmni.yml
              - generic [ref=e228]:
                - generic [ref=e229]: May 2, 11:06 PM
                - generic [ref=e230]: ·
                - generic [ref=e231]: 92 B
            - button [ref=e232]:
              - img
          - generic [ref=e233] [cursor=pointer]:
            - img [ref=e234]
            - generic [ref=e237]:
              - generic [ref=e238]: fm12-moohvdo8-4p7vs0.yml
              - generic [ref=e239]:
                - generic [ref=e240]: May 2, 10:26 PM
                - generic [ref=e241]: ·
                - generic [ref=e242]: 92 B
            - button [ref=e243]:
              - img
          - generic [ref=e244] [cursor=pointer]:
            - img [ref=e245]
            - generic [ref=e248]:
              - generic [ref=e249]: fm12-renamed-mooihkd2-914sg1.yml
              - generic [ref=e250]:
                - generic [ref=e251]: May 2, 10:43 PM
                - generic [ref=e252]: ·
                - generic [ref=e253]: 92 B
            - button [ref=e254]:
              - img
          - generic [ref=e255] [cursor=pointer]:
            - img [ref=e256]
            - generic [ref=e259]:
              - generic [ref=e260]: fm12-renamed-moojaf3f-tuw5jp.yml
              - generic [ref=e261]:
                - generic [ref=e262]: May 2, 11:06 PM
                - generic [ref=e263]: ·
                - generic [ref=e264]: 92 B
            - button [ref=e265]:
              - img
          - generic [ref=e266] [cursor=pointer]:
            - img [ref=e267]
            - generic [ref=e270]:
              - generic [ref=e271]: fm13-moohvmv0-jrmtno.yml
              - generic [ref=e272]:
                - generic [ref=e273]: May 2, 10:26 PM
                - generic [ref=e274]: ·
                - generic [ref=e275]: 92 B
            - button [ref=e276]:
              - img
          - generic [ref=e277] [cursor=pointer]:
            - img [ref=e278]
            - generic [ref=e281]:
              - generic [ref=e282]: fm13-mooihqpr-zw9s49.yml
              - generic [ref=e283]:
                - generic [ref=e284]: May 2, 10:43 PM
                - generic [ref=e285]: ·
                - generic [ref=e286]: 92 B
            - button [ref=e287]:
              - img
          - generic [ref=e288] [cursor=pointer]:
            - img [ref=e289]
            - generic [ref=e292]:
              - generic [ref=e293]: fm13-moojai9s-s67zfc.yml
              - generic [ref=e294]:
                - generic [ref=e295]: May 2, 11:06 PM
                - generic [ref=e296]: ·
                - generic [ref=e297]: 92 B
            - button [ref=e298]:
              - img
          - generic [ref=e299] [cursor=pointer]:
            - img [ref=e300]
            - generic [ref=e303]:
              - generic [ref=e304]: fm14a-moohwakh-irb7x1.yml
              - generic [ref=e305]:
                - generic [ref=e306]: May 2, 10:27 PM
                - generic [ref=e307]: ·
                - generic [ref=e308]: 92 B
            - button [ref=e309]:
              - img
          - generic [ref=e310] [cursor=pointer]:
            - img [ref=e311]
            - generic [ref=e314]:
              - generic [ref=e315]: fm14b-mooihxbh-fxb7yc.yml
              - generic [ref=e316]:
                - generic [ref=e317]: May 2, 10:44 PM
                - generic [ref=e318]: ·
                - generic [ref=e319]: 92 B
            - button [ref=e320]:
              - img
          - generic [ref=e321] [cursor=pointer]:
            - img [ref=e322]
            - generic [ref=e325]:
              - generic [ref=e326]: fm14b-moojam60-2mg8x3.yml
              - generic [ref=e327]:
                - generic [ref=e328]: May 2, 11:06 PM
                - generic [ref=e329]: ·
                - generic [ref=e330]: 92 B
            - button [ref=e331]:
              - img
          - generic [ref=e332] [cursor=pointer]:
            - img [ref=e333]
            - generic [ref=e336]:
              - generic [ref=e337]: fm15-moohwyn8-qp4me9.yml
              - generic [ref=e338]:
                - generic [ref=e339]: May 2, 10:27 PM
                - generic [ref=e340]: ·
                - generic [ref=e341]: 92 B
            - button [ref=e342]:
              - img
          - generic [ref=e343] [cursor=pointer]:
            - img [ref=e344]
            - generic [ref=e347]:
              - generic [ref=e348]: fm15-mooii8qk-lx16k5.yml
              - generic [ref=e349]:
                - generic [ref=e350]: May 2, 10:44 PM
                - generic [ref=e351]: ·
                - generic [ref=e352]: 92 B
            - button [ref=e353]:
              - img
          - generic [ref=e354] [cursor=pointer]:
            - img [ref=e355]
            - generic [ref=e358]:
              - generic [ref=e359]: fm16-moohx39t-wotcuk.yml
              - generic [ref=e360]:
                - generic [ref=e361]: May 2, 10:27 PM
                - generic [ref=e362]: ·
                - generic [ref=e363]: 92 B
            - button [ref=e364]:
              - img
          - generic [ref=e365] [cursor=pointer]:
            - img [ref=e366]
            - generic [ref=e369]:
              - generic [ref=e370]: fm16-mooiifrs-yqf29c.yml
              - generic [ref=e371]:
                - generic [ref=e372]: May 2, 10:44 PM
                - generic [ref=e373]: ·
                - generic [ref=e374]: 92 B
            - button [ref=e375]:
              - img
          - generic [ref=e376] [cursor=pointer]:
            - img [ref=e377]
            - generic [ref=e380]:
              - generic [ref=e381]: fm17-moohxrak-uqqs1o.yml
              - generic [ref=e382]:
                - generic [ref=e383]: May 2, 10:28 PM
                - generic [ref=e384]: ·
                - generic [ref=e385]: 92 B
            - button [ref=e386]:
              - img
          - generic [ref=e387] [cursor=pointer]:
            - img [ref=e388]
            - generic [ref=e391]:
              - generic [ref=e392]: fm17-mooij3sm-z07a78.yml
              - generic [ref=e393]:
                - generic [ref=e394]: May 2, 10:44 PM
                - generic [ref=e395]: ·
                - generic [ref=e396]: 92 B
            - button [ref=e397]:
              - img
          - generic [ref=e398] [cursor=pointer]:
            - img [ref=e399]
            - generic [ref=e402]:
              - generic [ref=e403]: fm18-dup-mooijcgi-u8ctey.yml
              - generic [ref=e404]:
                - generic [ref=e405]: May 2, 10:45 PM
                - generic [ref=e406]: ·
                - generic [ref=e407]: 92 B
            - button [ref=e408]:
              - img
          - generic [ref=e409] [cursor=pointer]:
            - img [ref=e410]
            - generic [ref=e413]:
              - generic [ref=e414]: fm18-moohxxuu-tg44uu.yml
              - generic [ref=e415]:
                - generic [ref=e416]: May 2, 10:28 PM
                - generic [ref=e417]: ·
                - generic [ref=e418]: 92 B
            - button [ref=e419]:
              - img
          - generic [ref=e420] [cursor=pointer]:
            - img [ref=e421]
            - generic [ref=e424]:
              - generic [ref=e425]: fm18-mooijair-iebs6m.yml
              - generic [ref=e426]:
                - generic [ref=e427]: May 2, 10:45 PM
                - generic [ref=e428]: ·
                - generic [ref=e429]: 92 B
            - button [ref=e430]:
              - img
          - generic [ref=e431] [cursor=pointer]:
            - img [ref=e432]
            - generic [ref=e435]:
              - generic [ref=e436]: fm19-mooijfq8-gro411.yml
              - generic [ref=e437]:
                - generic [ref=e438]: May 2, 10:45 PM
                - generic [ref=e439]: ·
                - generic [ref=e440]: 92 B
            - button [ref=e441]:
              - img
          - generic [ref=e442] [cursor=pointer]:
            - img [ref=e443]
            - generic [ref=e446]:
              - generic [ref=e447]: fm20-mooijmo8-ac3tar-copy.yaml
              - generic [ref=e448]:
                - generic [ref=e449]: May 2, 10:45 PM
                - generic [ref=e450]: ·
                - generic [ref=e451]: 92 B
            - button [ref=e452]:
              - img
          - generic [ref=e453] [cursor=pointer]:
            - img [ref=e454]
            - generic [ref=e457]:
              - generic [ref=e458]: fm20-mooijmo8-ac3tar.yml
              - generic [ref=e459]:
                - generic [ref=e460]: May 2, 10:45 PM
                - generic [ref=e461]: ·
                - generic [ref=e462]: 92 B
            - button [ref=e463]:
              - img
          - generic [ref=e464] [cursor=pointer]:
            - img [ref=e465]
            - generic [ref=e468]:
              - generic [ref=e469]: fm22-mooik2u6-3zoj8v.yml
              - generic [ref=e470]:
                - generic [ref=e471]: May 2, 10:45 PM
                - generic [ref=e472]: ·
                - generic [ref=e473]: 92 B
            - button [ref=e474]:
              - img
          - generic [ref=e475] [cursor=pointer]:
            - img [ref=e476]
            - generic [ref=e479]:
              - generic [ref=e480]: fm25-mooikgel-14bmku.yml
              - generic [ref=e481]:
                - generic [ref=e482]: May 2, 10:46 PM
                - generic [ref=e483]: ·
                - generic [ref=e484]: 31 B
            - button [ref=e485]:
              - img
          - generic [ref=e486] [cursor=pointer]:
            - img [ref=e487]
            - generic [ref=e490]:
              - generic [ref=e491]: fm27-mooikm60-htsi9i.yml
              - generic [ref=e492]:
                - generic [ref=e493]: May 2, 10:46 PM
                - generic [ref=e494]: ·
                - generic [ref=e495]: 31 B
            - button [ref=e496]:
              - img
          - generic [ref=e497] [cursor=pointer]:
            - img [ref=e498]
            - generic [ref=e501]:
              - generic [ref=e502]: lkfa.yml
              - generic [ref=e503]:
                - generic [ref=e504]: Apr 29, 03:01 AM
                - generic [ref=e505]: ·
                - generic [ref=e506]: 92 B
            - button [ref=e507]:
              - img
          - generic [ref=e508] [cursor=pointer]:
            - img [ref=e509]
            - generic [ref=e512]:
              - generic [ref=e513]: prometheus-copy.yml
              - generic [ref=e514]:
                - generic [ref=e515]: May 2, 09:53 PM
                - generic [ref=e516]: ·
                - generic [ref=e517]: 20.3 KB
            - button [ref=e518]:
              - img
          - generic [ref=e519] [cursor=pointer]:
            - img [ref=e520]
            - generic [ref=e523]:
              - generic [ref=e524]: prometheus.yml
              - generic [ref=e525]:
                - generic [ref=e526]: Apr 29, 03:03 AM
                - generic [ref=e527]: ·
                - generic [ref=e528]: 19.6 KB
            - button [ref=e529]:
              - img
          - generic [ref=e530] [cursor=pointer]:
            - img [ref=e531]
            - generic [ref=e534]:
              - generic [ref=e535]: sfsd.yml
              - generic [ref=e536]:
                - generic [ref=e537]: Apr 29, 04:43 AM
                - generic [ref=e538]: ·
                - generic [ref=e539]: 92 B
            - button [ref=e540]:
              - img
          - generic [ref=e541] [cursor=pointer]:
            - img [ref=e542]
            - generic [ref=e545]:
              - generic [ref=e546]: smkoq.yml
              - generic [ref=e547]:
                - generic [ref=e548]: Apr 29, 03:00 AM
                - generic [ref=e549]: ·
                - generic [ref=e550]: 92 B
            - button [ref=e551]:
              - img
          - generic [ref=e552] [cursor=pointer]:
            - img [ref=e553]
            - generic [ref=e556]:
              - generic [ref=e557]: ssdasqdaasdasd.yml
              - generic [ref=e558]:
                - generic [ref=e559]: May 2, 09:53 PM
                - generic [ref=e560]: ·
                - generic [ref=e561]: 627 B
            - button [ref=e562]:
              - img
          - generic [ref=e563] [cursor=pointer]:
            - img [ref=e564]
            - generic [ref=e567]:
              - generic [ref=e568]: test-markers.yml
              - generic [ref=e569]:
                - generic [ref=e570]: Apr 29, 05:21 AM
                - generic [ref=e571]: ·
                - generic [ref=e572]: 92 B
            - button [ref=e573]:
              - img
          - generic [ref=e574] [cursor=pointer]:
            - img [ref=e575]
            - generic [ref=e578]:
              - generic [ref=e579]: test-unsaved.yml
              - generic [ref=e580]:
                - generic [ref=e581]: Apr 29, 03:34 AM
                - generic [ref=e582]: ·
                - generic [ref=e583]: 92 B
            - button [ref=e584]:
              - img
          - generic [ref=e585] [cursor=pointer]:
            - img [ref=e586]
            - generic [ref=e589]:
              - generic [ref=e590]: test1.yml
              - generic [ref=e591]:
                - generic [ref=e592]: Apr 29, 11:11 AM
                - generic [ref=e593]: ·
                - generic [ref=e594]: 92 B
            - button [ref=e595]:
              - img
        - button "New File" [ref=e597]:
          - img
          - text: New File
      - separator [ref=e598]:
        - img [ref=e600]
      - generic [ref=e608]:
        - generic [ref=e609]:
          - generic [ref=e610]: Configuration
          - button [ref=e611]:
            - img
        - generic [ref=e615]:
          - button "Global" [ref=e617]:
            - img [ref=e618]
            - generic [ref=e621]: Global
          - button "Scrape Configs" [ref=e623]:
            - img [ref=e624]
            - generic [ref=e627]: Scrape Configs
          - button "Rule Files" [ref=e629]:
            - img [ref=e630]
            - generic [ref=e633]: Rule Files
          - button "Alerting / Alertmanagers" [ref=e635]:
            - img [ref=e636]
            - generic [ref=e639]: Alerting / Alertmanagers
          - button "Remote Write" [ref=e641]:
            - img [ref=e642]
            - generic [ref=e645]: Remote Write
          - button "Remote Read" [ref=e647]:
            - img [ref=e648]
            - generic [ref=e651]: Remote Read
          - button "Storage" [ref=e653]:
            - img [ref=e654]
            - generic [ref=e658]: Storage
          - button "Tracing" [ref=e660]:
            - img [ref=e661]
            - generic [ref=e663]: Tracing
      - separator [ref=e664]:
        - img [ref=e666]
      - generic [ref=e674]:
        - generic [ref=e675]:
          - generic [ref=e676]:
            - generic [ref=e677]: Active file
            - generic [ref=e678]: fm14b-moojam60-2mg8x3.yml
          - button "Stats" [ref=e681]:
            - img
            - text: Stats
          - button "History 1" [ref=e683]:
            - img
            - text: History
            - generic [ref=e684]: "1"
          - button "Validate YAML" [ref=e686]
          - generic [ref=e687]:
            - button "Save file" [disabled]:
              - img
              - text: Save file
        - generic [ref=e689]:
          - generic [ref=e690]:
            - generic [ref=e691]:
              - img [ref=e693]
              - generic [ref=e696]:
                - heading "Scrape Configurations" [level=2] [ref=e697]
                - paragraph [ref=e698]: 0 jobs · 0 targets
            - generic [ref=e699]:
              - button "Prefix View" [ref=e701]:
                - img
                - text: Prefix View
              - button "Add Job" [ref=e703]:
                - img
                - text: Add Job
          - generic [ref=e704]:
            - generic [ref=e705]:
              - img [ref=e706]
              - textbox "Search jobs or targets..." [ref=e709]
            - button "Actions" [ref=e710]:
              - img
              - text: Actions
            - button "Groups" [ref=e711]:
              - img
              - text: Groups
            - combobox [ref=e712]:
              - generic: All jobs
              - img
          - generic [ref=e716]:
            - img [ref=e717]
            - paragraph [ref=e720]: No scrape configs defined
      - separator [ref=e721]:
        - img [ref=e723]
      - generic [ref=e732]:
        - generic [ref=e733]:
          - generic [ref=e734]:
            - img [ref=e735]
            - generic [ref=e740]: fm14b-moojam60-2mg8x3.yml
            - generic [ref=e741]: 6 lines
          - generic [ref=e742]:
            - button [ref=e744]:
              - img
            - button [ref=e746]:
              - img
            - button [ref=e748]:
              - img
            - button [ref=e750]:
              - img
        - code [ref=e754]:
          - generic [ref=e755]:
            - textbox "Editor content" [ref=e756]
            - textbox [ref=e757]
            - generic [ref=e759]:
              - generic [ref=e760]:
                - generic [ref=e762] [cursor=pointer]: 
                - generic [ref=e763]: "1"
              - generic [ref=e765]: "2"
              - generic [ref=e767]: "3"
              - generic [ref=e769]: "4"
              - generic [ref=e771]: "5"
              - generic [ref=e773]: "6"
            - generic [ref=e784]:
              - generic [ref=e786]: "global:"
              - generic [ref=e788]: "scrape_interval: 15s"
              - generic [ref=e790]: "evaluation_interval: 15s"
              - generic [ref=e793]: "scrape_configs: []"
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e804] [cursor=pointer]:
    - img [ref=e805]
  - alert [ref=e808]
  - generic [ref=e809]:
    - alert
    - alert
```

# Test source

```ts
  74  | 
  75  |   test('FM-07 Create file — duplicate name triggers conflict', async ({ page }) => {
  76  |     const base = uniqueName('fm07')
  77  |     await createFile(page, base)
  78  |     // Try to create the same name again
  79  |     await page.getByTestId('new-file-btn').click()
  80  |     const dialog = page.getByRole('dialog')
  81  |     await dialog.getByPlaceholder('prometheus').fill(base)
  82  |     await page.getByTestId('create-file-confirm-btn').click()
  83  |     await expect(page.getByRole('heading', { name: 'File already exists' })).toBeVisible()
  84  |     // Suggested alternative is pre-filled in the conflict dialog.
  85  |     const newNameInput = page.getByRole('dialog').getByRole('textbox')
  86  |     await expect(newNameInput).not.toHaveValue('')
  87  |   })
  88  | 
  89  |   test('FM-08 Create file — cancel discards input', async ({ page }) => {
  90  |     const base = uniqueName('fm08')
  91  |     await page.getByTestId('new-file-btn').click()
  92  |     const dialog = page.getByRole('dialog')
  93  |     await dialog.getByPlaceholder('prometheus').fill(base)
  94  |     await page.getByTestId('create-file-cancel-btn').click()
  95  |     await expect(dialog).toBeHidden()
  96  |     // No file with that name should exist.
  97  |     await expect(fileItem(page, `${base}.yml`)).toHaveCount(0)
  98  |     // Reopening the dialog should show empty input.
  99  |     await page.getByTestId('new-file-btn').click()
  100 |     await expect(page.getByRole('dialog').getByPlaceholder('prometheus')).toHaveValue('')
  101 |     await page.getByTestId('create-file-cancel-btn').click()
  102 |   })
  103 | 
  104 |   test('FM-09 Create file — Enter key submits', async ({ page }) => {
  105 |     const base = uniqueName('fm09')
  106 |     await page.getByTestId('new-file-btn').click()
  107 |     const dialog = page.getByRole('dialog')
  108 |     await dialog.getByPlaceholder('prometheus').fill(base)
  109 |     await dialog.getByPlaceholder('prometheus').press('Enter')
  110 |     await expect(dialog).toBeHidden()
  111 |     await expect(fileItem(page, `${base}.yml`)).toBeVisible()
  112 |   })
  113 | 
  114 |   test('FM-10 Create file — Escape closes dialog', async ({ page }) => {
  115 |     const base = uniqueName('fm10')
  116 |     await page.getByTestId('new-file-btn').click()
  117 |     const dialog = page.getByRole('dialog')
  118 |     await dialog.getByPlaceholder('prometheus').fill(base)
  119 |     await page.keyboard.press('Escape')
  120 |     await expect(dialog).toBeHidden()
  121 |     await expect(fileItem(page, `${base}.yml`)).toHaveCount(0)
  122 |   })
  123 | 
  124 |   // ─── Select / activate ────────────────────────────────────────────────────
  125 | 
  126 |   test('FM-11 Select file', async ({ page }) => {
  127 |     const base = uniqueName('fm11')
  128 |     const filename = await createFile(page, base)
  129 |     const row = fileItem(page, filename)
  130 |     await row.click()
  131 |     await page.waitForTimeout(400)
  132 |     // Active row receives the bg-accent class.
  133 |     await expect(row).toHaveClass(/bg-accent/)
  134 |   })
  135 | 
  136 |   // ─── Rename file ─────────────────────────────────────────────────────────
  137 | 
  138 |   test('FM-12 Rename file — happy path', async ({ page }) => {
  139 |     const base = uniqueName('fm12')
  140 |     const filename = await createFile(page, base)
  141 |     const newBase = uniqueName('fm12-renamed')
  142 |     await openRowMenu(page, filename, 'Rename')
  143 |     await expect(page.getByRole('heading', { name: 'Rename File' })).toBeVisible()
  144 |     const input = page.getByRole('dialog').getByRole('textbox')
  145 |     await input.fill(newBase)
  146 |     await page.getByTestId('rename-confirm-btn').click()
  147 |     await expect(page.getByRole('dialog')).toBeHidden()
  148 |     await expect(fileItem(page, `${newBase}.yml`)).toBeVisible()
  149 |     await expect(fileItem(page, filename)).toHaveCount(0)
  150 |   })
  151 | 
  152 |   test('FM-13 Rename file — slash rejected', async ({ page }) => {
  153 |     const base = uniqueName('fm13')
  154 |     const filename = await createFile(page, base)
  155 |     await openRowMenu(page, filename, 'Rename')
  156 |     const input = page.getByRole('dialog').getByRole('textbox')
  157 |     await input.fill('../bad')
  158 |     await page.getByTestId('rename-confirm-btn').click()
  159 |     await expect(page.getByRole('heading', { name: 'Rename File' })).toBeVisible()
  160 |     await expect(page.getByText(/slashes/i)).toBeVisible()
  161 |   })
  162 | 
  163 |   test('FM-14 Rename file — rename to existing name', async ({ page }) => {
  164 |     const a = uniqueName('fm14a')
  165 |     const b = uniqueName('fm14b')
  166 |     const fileA = await createFile(page, a)
  167 |     await createFile(page, b)
  168 |     await openRowMenu(page, fileA, 'Rename')
  169 |     const input = page.getByRole('dialog').getByRole('textbox')
  170 |     await input.fill(b)
  171 |     await page.getByTestId('rename-confirm-btn').click()
  172 |     // Dialog stays open with an error.
  173 |     await expect(page.getByRole('heading', { name: 'Rename File' })).toBeVisible()
> 174 |     await expect(page.getByText(/already exists|exists/i).first()).toBeVisible()
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  175 |   })
  176 | 
  177 |   test('FM-15 Rename file — same name is graceful', async ({ page }) => {
  178 |     const base = uniqueName('fm15')
  179 |     const filename = await createFile(page, base)
  180 |     await openRowMenu(page, filename, 'Rename')
  181 |     // Confirm without modifying.
  182 |     await page.getByTestId('rename-confirm-btn').click()
  183 |     await expect(page.getByRole('dialog')).toBeHidden()
  184 |     await expect(fileItem(page, filename)).toBeVisible()
  185 |   })
  186 | 
  187 |   test('FM-16 Rename file — Enter key submits', async ({ page }) => {
  188 |     const base = uniqueName('fm16')
  189 |     const filename = await createFile(page, base)
  190 |     const newBase = uniqueName('fm16-after')
  191 |     await openRowMenu(page, filename, 'Rename')
  192 |     const input = page.getByRole('dialog').getByRole('textbox')
  193 |     await input.fill(newBase)
  194 |     await input.press('Enter')
  195 |     await expect(page.getByRole('dialog')).toBeHidden()
  196 |     await expect(fileItem(page, `${newBase}.yml`)).toBeVisible()
  197 |   })
  198 | 
  199 |   test('FM-17 Rename file — cancel leaves file unchanged', async ({ page }) => {
  200 |     const base = uniqueName('fm17')
  201 |     const filename = await createFile(page, base)
  202 |     await openRowMenu(page, filename, 'Rename')
  203 |     await page.getByRole('dialog').getByRole('textbox').fill('something-else')
  204 |     await page.getByTestId('rename-cancel-btn').click()
  205 |     await expect(page.getByRole('dialog')).toBeHidden()
  206 |     await expect(fileItem(page, filename)).toBeVisible()
  207 |   })
  208 | 
  209 |   // ─── Duplicate file ──────────────────────────────────────────────────────
  210 | 
  211 |   test('FM-18 Duplicate file — happy path', async ({ page }) => {
  212 |     const base = uniqueName('fm18')
  213 |     const filename = await createFile(page, base)
  214 |     await openRowMenu(page, filename, 'Duplicate')
  215 |     await expect(page.getByRole('heading', { name: 'Duplicate File' })).toBeVisible()
  216 |     // Default suggestion is `<base>-copy.yaml` — clear and use a unique name.
  217 |     const input = page.getByRole('dialog').getByRole('textbox')
  218 |     const dupBase = uniqueName('fm18-dup')
  219 |     await input.fill(dupBase)
  220 |     await page.getByRole('button', { name: 'Duplicate' }).click()
  221 |     await expect(page.getByRole('dialog')).toBeHidden()
  222 |     await expect(fileItem(page, `${dupBase}.yml`)).toBeVisible()
  223 |     await expect(fileItem(page, filename)).toBeVisible()
  224 |   })
  225 | 
  226 |   test('FM-19 Duplicate file — name pre-filled', async ({ page }) => {
  227 |     const base = uniqueName('fm19')
  228 |     const filename = await createFile(page, base)
  229 |     await openRowMenu(page, filename, 'Duplicate')
  230 |     const input = page.getByRole('dialog').getByRole('textbox')
  231 |     await expect(input).toHaveValue(`${base}-copy.yaml`)
  232 |   })
  233 | 
  234 |   test('FM-20 Duplicate file — auto-increments if copy exists', async ({ page }) => {
  235 |     const base = uniqueName('fm20')
  236 |     const filename = await createFile(page, base)
  237 | 
  238 |     // Create the first copy.
  239 |     await openRowMenu(page, filename, 'Duplicate')
  240 |     let input = page.getByRole('dialog').getByRole('textbox')
  241 |     await expect(input).toHaveValue(`${base}-copy.yaml`)
  242 |     await page.getByRole('button', { name: 'Duplicate' }).click()
  243 |     await expect(page.getByRole('dialog')).toBeHidden()
  244 | 
  245 |     // Open Duplicate again — suggestion should now be incremented.
  246 |     await openRowMenu(page, filename, 'Duplicate')
  247 |     input = page.getByRole('dialog').getByRole('textbox')
  248 |     await expect(input).toHaveValue(`${base}-copy-1.yaml`)
  249 |     await page.getByRole('button', { name: 'Cancel' }).click()
  250 |   })
  251 | 
  252 |   // ─── Delete file ─────────────────────────────────────────────────────────
  253 | 
  254 |   test('FM-21 Delete file — confirm', async ({ page }) => {
  255 |     const base = uniqueName('fm21')
  256 |     const filename = await createFile(page, base)
  257 |     await openRowMenu(page, filename, 'Delete')
  258 |     await expect(page.getByRole('heading', { name: 'Delete Config File' })).toBeVisible()
  259 |     await page.getByTestId('delete-confirm-btn').click()
  260 |     await expect(page.getByRole('dialog')).toBeHidden()
  261 |     await expect(fileItem(page, filename)).toHaveCount(0)
  262 |   })
  263 | 
  264 |   test('FM-22 Delete file — cancel', async ({ page }) => {
  265 |     const base = uniqueName('fm22')
  266 |     const filename = await createFile(page, base)
  267 |     await openRowMenu(page, filename, 'Delete')
  268 |     await page.getByTestId('delete-cancel-btn').click()
  269 |     await expect(page.getByRole('dialog')).toBeHidden()
  270 |     await expect(fileItem(page, filename)).toBeVisible()
  271 |   })
  272 | 
  273 |   test('FM-23 Delete active file', async ({ page }) => {
  274 |     const base = uniqueName('fm23')
```