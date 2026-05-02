# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-explorer.spec.ts >> File Explorer Panel >> Unsaved changes guard >> UC-05 "Keep" — stays on current file
- Location: tests\e2e\file-explorer.spec.ts:475:9

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
              - generic [ref=e359]: fm15-moojavsj-qk0759.yml
              - generic [ref=e360]:
                - generic [ref=e361]: May 2, 11:06 PM
                - generic [ref=e362]: ·
                - generic [ref=e363]: 92 B
            - button [ref=e364]:
              - img
          - generic [ref=e365] [cursor=pointer]:
            - img [ref=e366]
            - generic [ref=e369]:
              - generic [ref=e370]: fm16-after-moojb289-9fbjml.yml
              - generic [ref=e371]:
                - generic [ref=e372]: May 2, 11:06 PM
                - generic [ref=e373]: ·
                - generic [ref=e374]: 92 B
            - button [ref=e375]:
              - img
          - generic [ref=e376] [cursor=pointer]:
            - img [ref=e377]
            - generic [ref=e380]:
              - generic [ref=e381]: fm16-moohx39t-wotcuk.yml
              - generic [ref=e382]:
                - generic [ref=e383]: May 2, 10:27 PM
                - generic [ref=e384]: ·
                - generic [ref=e385]: 92 B
            - button [ref=e386]:
              - img
          - generic [ref=e387] [cursor=pointer]:
            - img [ref=e388]
            - generic [ref=e391]:
              - generic [ref=e392]: fm16-mooiifrs-yqf29c.yml
              - generic [ref=e393]:
                - generic [ref=e394]: May 2, 10:44 PM
                - generic [ref=e395]: ·
                - generic [ref=e396]: 92 B
            - button [ref=e397]:
              - img
          - generic [ref=e398] [cursor=pointer]:
            - img [ref=e399]
            - generic [ref=e402]:
              - generic [ref=e403]: fm17-moohxrak-uqqs1o.yml
              - generic [ref=e404]:
                - generic [ref=e405]: May 2, 10:28 PM
                - generic [ref=e406]: ·
                - generic [ref=e407]: 92 B
            - button [ref=e408]:
              - img
          - generic [ref=e409] [cursor=pointer]:
            - img [ref=e410]
            - generic [ref=e413]:
              - generic [ref=e414]: fm17-mooij3sm-z07a78.yml
              - generic [ref=e415]:
                - generic [ref=e416]: May 2, 10:44 PM
                - generic [ref=e417]: ·
                - generic [ref=e418]: 92 B
            - button [ref=e419]:
              - img
          - generic [ref=e420] [cursor=pointer]:
            - img [ref=e421]
            - generic [ref=e424]:
              - generic [ref=e425]: fm17-moojb4h9-4s5tb4.yml
              - generic [ref=e426]:
                - generic [ref=e427]: May 2, 11:06 PM
                - generic [ref=e428]: ·
                - generic [ref=e429]: 92 B
            - button [ref=e430]:
              - img
          - generic [ref=e431] [cursor=pointer]:
            - img [ref=e432]
            - generic [ref=e435]:
              - generic [ref=e436]: fm18-dup-mooijcgi-u8ctey.yml
              - generic [ref=e437]:
                - generic [ref=e438]: May 2, 10:45 PM
                - generic [ref=e439]: ·
                - generic [ref=e440]: 92 B
            - button [ref=e441]:
              - img
          - generic [ref=e442] [cursor=pointer]:
            - img [ref=e443]
            - generic [ref=e446]:
              - generic [ref=e447]: fm18-dup-moojbbfl-niqi02.yml
              - generic [ref=e448]:
                - generic [ref=e449]: May 2, 11:06 PM
                - generic [ref=e450]: ·
                - generic [ref=e451]: 92 B
            - button [ref=e452]:
              - img
          - generic [ref=e453] [cursor=pointer]:
            - img [ref=e454]
            - generic [ref=e457]:
              - generic [ref=e458]: fm18-moohxxuu-tg44uu.yml
              - generic [ref=e459]:
                - generic [ref=e460]: May 2, 10:28 PM
                - generic [ref=e461]: ·
                - generic [ref=e462]: 92 B
            - button [ref=e463]:
              - img
          - generic [ref=e464] [cursor=pointer]:
            - img [ref=e465]
            - generic [ref=e468]:
              - generic [ref=e469]: fm18-mooijair-iebs6m.yml
              - generic [ref=e470]:
                - generic [ref=e471]: May 2, 10:45 PM
                - generic [ref=e472]: ·
                - generic [ref=e473]: 92 B
            - button [ref=e474]:
              - img
          - generic [ref=e475] [cursor=pointer]:
            - img [ref=e476]
            - generic [ref=e479]:
              - generic [ref=e480]: fm18-moojb8ms-0a08c6.yml
              - generic [ref=e481]:
                - generic [ref=e482]: May 2, 11:06 PM
                - generic [ref=e483]: ·
                - generic [ref=e484]: 92 B
            - button [ref=e485]:
              - img
          - generic [ref=e486] [cursor=pointer]:
            - img [ref=e487]
            - generic [ref=e490]:
              - generic [ref=e491]: fm19-mooijfq8-gro411.yml
              - generic [ref=e492]:
                - generic [ref=e493]: May 2, 10:45 PM
                - generic [ref=e494]: ·
                - generic [ref=e495]: 92 B
            - button [ref=e496]:
              - img
          - generic [ref=e497] [cursor=pointer]:
            - img [ref=e498]
            - generic [ref=e501]:
              - generic [ref=e502]: fm19-moojbd8u-7jal2m.yml
              - generic [ref=e503]:
                - generic [ref=e504]: May 2, 11:06 PM
                - generic [ref=e505]: ·
                - generic [ref=e506]: 92 B
            - button [ref=e507]:
              - img
          - generic [ref=e508] [cursor=pointer]:
            - img [ref=e509]
            - generic [ref=e512]:
              - generic [ref=e513]: fm20-mooijmo8-ac3tar-copy.yaml
              - generic [ref=e514]:
                - generic [ref=e515]: May 2, 10:45 PM
                - generic [ref=e516]: ·
                - generic [ref=e517]: 92 B
            - button [ref=e518]:
              - img
          - generic [ref=e519] [cursor=pointer]:
            - img [ref=e520]
            - generic [ref=e523]:
              - generic [ref=e524]: fm20-mooijmo8-ac3tar.yml
              - generic [ref=e525]:
                - generic [ref=e526]: May 2, 10:45 PM
                - generic [ref=e527]: ·
                - generic [ref=e528]: 92 B
            - button [ref=e529]:
              - img
          - generic [ref=e530] [cursor=pointer]:
            - img [ref=e531]
            - generic [ref=e534]:
              - generic [ref=e535]: fm20-moojbgt4-t8or0k-copy.yaml
              - generic [ref=e536]:
                - generic [ref=e537]: May 2, 11:07 PM
                - generic [ref=e538]: ·
                - generic [ref=e539]: 92 B
            - button [ref=e540]:
              - img
          - generic [ref=e541] [cursor=pointer]:
            - img [ref=e542]
            - generic [ref=e545]:
              - generic [ref=e546]: fm20-moojbgt4-t8or0k.yml
              - generic [ref=e547]:
                - generic [ref=e548]: May 2, 11:07 PM
                - generic [ref=e549]: ·
                - generic [ref=e550]: 92 B
            - button [ref=e551]:
              - img
          - generic [ref=e552] [cursor=pointer]:
            - img [ref=e553]
            - generic [ref=e556]:
              - generic [ref=e557]: fm22-mooik2u6-3zoj8v.yml
              - generic [ref=e558]:
                - generic [ref=e559]: May 2, 10:45 PM
                - generic [ref=e560]: ·
                - generic [ref=e561]: 92 B
            - button [ref=e562]:
              - img
          - generic [ref=e563] [cursor=pointer]:
            - img [ref=e564]
            - generic [ref=e567]:
              - generic [ref=e568]: fm22-moojbtis-vjh35k.yml
              - generic [ref=e569]:
                - generic [ref=e570]: May 2, 11:07 PM
                - generic [ref=e571]: ·
                - generic [ref=e572]: 92 B
            - button [ref=e573]:
              - img
          - generic [ref=e574] [cursor=pointer]:
            - img [ref=e575]
            - generic [ref=e578]:
              - generic [ref=e579]: fm23-moojbxsi-oqdcsy.yml
              - generic [ref=e580]:
                - generic [ref=e581]: May 2, 11:07 PM
                - generic [ref=e582]: ·
                - generic [ref=e583]: 92 B
            - button [ref=e584]:
              - img
          - generic [ref=e585] [cursor=pointer]:
            - img [ref=e586]
            - generic [ref=e589]:
              - generic [ref=e590]: fm25-mooikgel-14bmku.yml
              - generic [ref=e591]:
                - generic [ref=e592]: May 2, 10:46 PM
                - generic [ref=e593]: ·
                - generic [ref=e594]: 31 B
            - button [ref=e595]:
              - img
          - generic [ref=e596] [cursor=pointer]:
            - img [ref=e597]
            - generic [ref=e600]:
              - generic [ref=e601]: fm25-moojcn80-pgcok7.yml
              - generic [ref=e602]:
                - generic [ref=e603]: May 2, 11:07 PM
                - generic [ref=e604]: ·
                - generic [ref=e605]: 31 B
            - button [ref=e606]:
              - img
          - generic [ref=e607] [cursor=pointer]:
            - img [ref=e608]
            - generic [ref=e611]:
              - generic [ref=e612]: fm27-mooikm60-htsi9i.yml
              - generic [ref=e613]:
                - generic [ref=e614]: May 2, 10:46 PM
                - generic [ref=e615]: ·
                - generic [ref=e616]: 31 B
            - button [ref=e617]:
              - img
          - generic [ref=e618] [cursor=pointer]:
            - img [ref=e619]
            - generic [ref=e622]:
              - generic [ref=e623]: fm27-moojcq7m-3iyxvs.yml
              - generic [ref=e624]:
                - generic [ref=e625]: May 2, 11:08 PM
                - generic [ref=e626]: ·
                - generic [ref=e627]: 31 B
            - button [ref=e628]:
              - img
          - generic [ref=e629] [cursor=pointer]:
            - img [ref=e630]
            - generic [ref=e633]:
              - generic [ref=e634]: fm30a-moojcvi1-vdjah7.yml
              - generic [ref=e635]:
                - generic [ref=e636]: May 2, 11:08 PM
                - generic [ref=e637]: ·
                - generic [ref=e638]: 92 B
            - button [ref=e639]:
              - img
          - generic [ref=e640] [cursor=pointer]:
            - img [ref=e641]
            - generic [ref=e644]:
              - generic [ref=e645]: fm30b-moojcxtv-cyvuz9.yml
              - generic [ref=e646]:
                - generic [ref=e647]: May 2, 11:08 PM
                - generic [ref=e648]: ·
                - generic [ref=e649]: 92 B
            - button [ref=e650]:
              - img
          - generic [ref=e651] [cursor=pointer]:
            - img [ref=e652]
            - generic [ref=e655]:
              - generic [ref=e656]: fm30c-moojcz01-j2eo57.yml
              - generic [ref=e657]:
                - generic [ref=e658]: May 2, 11:08 PM
                - generic [ref=e659]: ·
                - generic [ref=e660]: 92 B
            - button [ref=e661]:
              - img
          - generic [ref=e662] [cursor=pointer]:
            - img [ref=e663]
            - generic [ref=e666]:
              - generic [ref=e667]: fm31-alt-moojd55f-ng6mbh.yml
              - generic [ref=e668]:
                - generic [ref=e669]: May 2, 11:08 PM
                - generic [ref=e670]: ·
                - generic [ref=e671]: 92 B
            - button [ref=e672]:
              - img
          - generic [ref=e673] [cursor=pointer]:
            - img [ref=e674]
            - generic [ref=e677]:
              - generic [ref=e678]: fm31-moojd2aj-vm8p1o.yml
              - generic [ref=e679]:
                - generic [ref=e680]: May 2, 11:08 PM
                - generic [ref=e681]: ·
                - generic [ref=e682]: 92 B
            - button [ref=e683]:
              - img
          - generic [ref=e684] [cursor=pointer]:
            - img [ref=e685]
            - generic [ref=e688]:
              - generic [ref=e689]: fm32a-moojd78l-43dwic.yml
              - generic [ref=e690]:
                - generic [ref=e691]: May 2, 11:08 PM
                - generic [ref=e692]: ·
                - generic [ref=e693]: 92 B
            - button [ref=e694]:
              - img
          - generic [ref=e695] [cursor=pointer]:
            - img [ref=e696]
            - generic [ref=e699]:
              - generic [ref=e700]: fm32b-moojd78l-eyi3b3.yml
              - generic [ref=e701]:
                - generic [ref=e702]: May 2, 11:08 PM
                - generic [ref=e703]: ·
                - generic [ref=e704]: 92 B
            - button [ref=e705]:
              - img
          - generic [ref=e706] [cursor=pointer]:
            - img [ref=e707]
            - generic [ref=e710]:
              - generic [ref=e711]: fm33-moojdcg0-h1vt54.yml
              - generic [ref=e712]:
                - generic [ref=e713]: May 2, 11:08 PM
                - generic [ref=e714]: ·
                - generic [ref=e715]: 92 B
            - button [ref=e716]:
              - img
          - generic [ref=e717] [cursor=pointer]:
            - img [ref=e718]
            - generic [ref=e721]:
              - generic [ref=e722]: lkfa.yml
              - generic [ref=e723]:
                - generic [ref=e724]: Apr 29, 03:01 AM
                - generic [ref=e725]: ·
                - generic [ref=e726]: 92 B
            - button [ref=e727]:
              - img
          - generic [ref=e728] [cursor=pointer]:
            - img [ref=e729]
            - generic [ref=e732]:
              - generic [ref=e733]: prometheus-copy.yml
              - generic [ref=e734]:
                - generic [ref=e735]: May 2, 09:53 PM
                - generic [ref=e736]: ·
                - generic [ref=e737]: 20.3 KB
            - button [ref=e738]:
              - img
          - generic [ref=e739] [cursor=pointer]:
            - img [ref=e740]
            - generic [ref=e743]:
              - generic [ref=e744]: prometheus.yml
              - generic [ref=e745]:
                - generic [ref=e746]: Apr 29, 03:03 AM
                - generic [ref=e747]: ·
                - generic [ref=e748]: 19.6 KB
            - button [ref=e749]:
              - img
          - generic [ref=e750] [cursor=pointer]:
            - img [ref=e751]
            - generic [ref=e754]:
              - generic [ref=e755]: sfsd.yml
              - generic [ref=e756]:
                - generic [ref=e757]: Apr 29, 04:43 AM
                - generic [ref=e758]: ·
                - generic [ref=e759]: 92 B
            - button [ref=e760]:
              - img
          - generic [ref=e761] [cursor=pointer]:
            - img [ref=e762]
            - generic [ref=e765]:
              - generic [ref=e766]: smkoq.yml
              - generic [ref=e767]:
                - generic [ref=e768]: Apr 29, 03:00 AM
                - generic [ref=e769]: ·
                - generic [ref=e770]: 92 B
            - button [ref=e771]:
              - img
          - generic [ref=e772] [cursor=pointer]:
            - img [ref=e773]
            - generic [ref=e776]:
              - generic [ref=e777]: ssdasqdaasdasd.yml
              - generic [ref=e778]:
                - generic [ref=e779]: May 2, 09:53 PM
                - generic [ref=e780]: ·
                - generic [ref=e781]: 627 B
            - button [ref=e782]:
              - img
          - generic [ref=e783] [cursor=pointer]:
            - img [ref=e784]
            - generic [ref=e787]:
              - generic [ref=e788]: test-markers.yml
              - generic [ref=e789]:
                - generic [ref=e790]: Apr 29, 05:21 AM
                - generic [ref=e791]: ·
                - generic [ref=e792]: 92 B
            - button [ref=e793]:
              - img
          - generic [ref=e794] [cursor=pointer]:
            - img [ref=e795]
            - generic [ref=e798]:
              - generic [ref=e799]: test-unsaved.yml
              - generic [ref=e800]:
                - generic [ref=e801]: Apr 29, 03:34 AM
                - generic [ref=e802]: ·
                - generic [ref=e803]: 92 B
            - button [ref=e804]:
              - img
          - generic [ref=e805] [cursor=pointer]:
            - img [ref=e806]
            - generic [ref=e809]:
              - generic [ref=e810]: test1.yml
              - generic [ref=e811]:
                - generic [ref=e812]: Apr 29, 11:11 AM
                - generic [ref=e813]: ·
                - generic [ref=e814]: 92 B
            - button [ref=e815]:
              - img
          - generic [ref=e816] [cursor=pointer]:
            - img [ref=e817]
            - generic [ref=e820]:
              - generic [ref=e821]: uc-a-moojdgnc-wypbfk.yml
              - generic [ref=e822]:
                - generic [ref=e823]: May 2, 11:08 PM
                - generic [ref=e824]: ·
                - generic [ref=e825]: 92 B
            - button [ref=e826]:
              - img
          - generic [ref=e827] [cursor=pointer]:
            - img [ref=e828]
            - generic [ref=e831]:
              - generic [ref=e832]: uc-a-mooje52u-gsf7jj.yml
              - generic [ref=e833]:
                - generic [ref=e834]: May 2, 11:09 PM
                - generic [ref=e835]: ·
                - generic [ref=e836]: 92 B
            - button [ref=e837]:
              - img
          - generic [ref=e838] [cursor=pointer]:
            - img [ref=e839]
            - generic [ref=e842]:
              - generic [ref=e843]: uc-a-moojeg8k-egkcla.yml
              - generic [ref=e844]:
                - generic [ref=e845]: May 2, 11:09 PM
                - generic [ref=e846]: ·
                - generic [ref=e847]: 92 B
            - button [ref=e848]:
              - img
          - generic [ref=e849] [cursor=pointer]:
            - img [ref=e850]
            - generic [ref=e853]:
              - generic [ref=e854]: uc-a-moojeqtn-3hugnd.yml
              - generic [ref=e855]:
                - generic [ref=e856]: May 2, 11:09 PM
                - generic [ref=e857]: ·
                - generic [ref=e858]: 92 B
            - button [ref=e859]:
              - img
          - generic [ref=e860] [cursor=pointer]:
            - img [ref=e861]
            - generic [ref=e864]:
              - generic [ref=e865]: uc-a-moojf1lu-f12zmq.yml
              - generic [ref=e866]:
                - generic [ref=e867]: May 2, 11:09 PM
                - generic [ref=e868]: ·
                - generic [ref=e869]: 92 B
            - button [ref=e870]:
              - img
          - generic [ref=e871] [cursor=pointer]:
            - img [ref=e872]
            - generic [ref=e875]:
              - generic [ref=e876]: uc-b-mooje7ba-9dmz38.yml
              - generic [ref=e877]:
                - generic [ref=e878]: May 2, 11:09 PM
                - generic [ref=e879]: ·
                - generic [ref=e880]: 92 B
            - button [ref=e881]:
              - img
          - generic [ref=e882] [cursor=pointer]:
            - img [ref=e883]
            - generic [ref=e886]:
              - generic [ref=e887]: uc-b-moojeigx-tebxps.yml
              - generic [ref=e888]:
                - generic [ref=e889]: May 2, 11:09 PM
                - generic [ref=e890]: ·
                - generic [ref=e891]: 92 B
            - button [ref=e892]:
              - img
          - generic [ref=e893] [cursor=pointer]:
            - img [ref=e894]
            - generic [ref=e897]:
              - generic [ref=e898]: uc-b-moojet1r-krivad.yml
              - generic [ref=e899]:
                - generic [ref=e900]: May 2, 11:09 PM
                - generic [ref=e901]: ·
                - generic [ref=e902]: 92 B
            - button [ref=e903]:
              - img
          - generic [ref=e904] [cursor=pointer]:
            - img [ref=e905]
            - generic [ref=e908]:
              - generic [ref=e909]: uc-b-moojf3xk-g2806v.yml
              - generic [ref=e910]:
                - generic [ref=e911]: May 2, 11:09 PM
                - generic [ref=e912]: ·
                - generic [ref=e913]: 92 B
            - button [ref=e914]:
              - img
        - button "New File" [ref=e916]:
          - img
          - text: New File
      - separator [ref=e917]:
        - img [ref=e919]
      - generic [ref=e927]:
        - generic [ref=e928]:
          - generic [ref=e929]: Configuration
          - button [ref=e930]:
            - img
        - generic [ref=e934]:
          - button "Global" [ref=e936]:
            - img [ref=e937]
            - generic [ref=e940]: Global
          - button "Scrape Configs" [ref=e942]:
            - img [ref=e943]
            - generic [ref=e946]: Scrape Configs
          - button "Rule Files" [ref=e948]:
            - img [ref=e949]
            - generic [ref=e952]: Rule Files
          - button "Alerting / Alertmanagers" [ref=e954]:
            - img [ref=e955]
            - generic [ref=e958]: Alerting / Alertmanagers
          - button "Remote Write" [ref=e960]:
            - img [ref=e961]
            - generic [ref=e964]: Remote Write
          - button "Remote Read" [ref=e966]:
            - img [ref=e967]
            - generic [ref=e970]: Remote Read
          - button "Storage" [ref=e972]:
            - img [ref=e973]
            - generic [ref=e977]: Storage
          - button "Tracing" [ref=e979]:
            - img [ref=e980]
            - generic [ref=e982]: Tracing
      - separator [ref=e983]:
        - img [ref=e985]
      - generic [ref=e993]:
        - generic [ref=e994]:
          - generic [ref=e995]:
            - generic [ref=e996]: Active file
            - generic [ref=e997]: uc-b-moojf3xk-g2806v.yml
          - button "Stats" [ref=e1000]:
            - img
            - text: Stats
          - button "History 1" [ref=e1002]:
            - img
            - text: History
            - generic [ref=e1003]: "1"
          - button "Validate YAML" [ref=e1005]
          - generic [ref=e1006]:
            - button "Save file" [disabled]:
              - img
              - text: Save file
        - generic [ref=e1008]:
          - generic [ref=e1009]:
            - generic [ref=e1010]:
              - img [ref=e1012]
              - generic [ref=e1015]:
                - heading "Scrape Configurations" [level=2] [ref=e1016]
                - paragraph [ref=e1017]: 0 jobs · 0 targets
            - generic [ref=e1018]:
              - button "Prefix View" [ref=e1020]:
                - img
                - text: Prefix View
              - button "Add Job" [ref=e1022]:
                - img
                - text: Add Job
          - generic [ref=e1023]:
            - generic [ref=e1024]:
              - img [ref=e1025]
              - textbox "Search jobs or targets..." [ref=e1028]
            - button "Actions" [ref=e1029]:
              - img
              - text: Actions
            - button "Groups" [ref=e1030]:
              - img
              - text: Groups
            - combobox [ref=e1031]:
              - generic: All jobs
              - img
          - generic [ref=e1035]:
            - img [ref=e1036]
            - paragraph [ref=e1039]: No scrape configs defined
      - separator [ref=e1040]:
        - img [ref=e1042]
      - generic [ref=e1051]:
        - generic [ref=e1052]:
          - generic [ref=e1053]:
            - img [ref=e1054]
            - generic [ref=e1059]: uc-b-moojf3xk-g2806v.yml
            - generic [ref=e1060]: 6 lines
          - generic [ref=e1061]:
            - button [ref=e1063]:
              - img
            - button [ref=e1065]:
              - img
            - button [ref=e1067]:
              - img
            - button [ref=e1069]:
              - img
        - code [ref=e1073]:
          - generic [ref=e1074]:
            - textbox "Editor content" [ref=e1075]
            - textbox [ref=e1076]
            - generic [ref=e1078]:
              - generic [ref=e1079]:
                - generic [ref=e1081] [cursor=pointer]: 
                - generic [ref=e1082]: "1"
              - generic [ref=e1084]: "2"
              - generic [ref=e1086]: "3"
              - generic [ref=e1088]: "4"
              - generic [ref=e1090]: "5"
              - generic [ref=e1092]: "6"
            - generic [ref=e1103]:
              - generic [ref=e1105]: "global:"
              - generic [ref=e1107]: "scrape_interval: 15s"
              - generic [ref=e1109]: "evaluation_interval: 15s"
              - generic [ref=e1112]: "scrape_configs: []"
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e1123] [cursor=pointer]:
    - img [ref=e1124]
  - alert [ref=e1127]
  - generic [ref=e1128]:
    - alert
    - alert
```

# Test source

```ts
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
  464 |       await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
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
> 478 |       await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
      |                                                                            ^ Error: expect(locator).toBeVisible() failed
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