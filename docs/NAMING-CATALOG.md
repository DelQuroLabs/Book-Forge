# Naming and place catalog — version 3

**45 countries, 387 state/province/region entries, 754 city entries and 65 real-world naming profiles**, plus a custom palette and four Antarctic station locations. Counts describe curated entries, not population statistics.

## Use it

In **Story forge**, a series **Shared bible**, or a character card, expand **Browse countries & places**. Filter by continent, then choose country → region → city. All countries remain accessible in the All continents view. A selected country outside the filter stays visibly marked until you choose a replacement; browsing a continent alone never changes the saved place. Transcontinental countries appear in both applicable filters.

The original free-text field still accepts any unlisted place. Selecting a location never changes an approved name or cultural background. Choose a naming background explicitly, then reroll/suggest the name. All profiles remain available for diaspora and mixed-cultural characters. Existing profile IDs, old seed behavior, saved books and series remain compatible; no database migration is needed.

## Requested large-country coverage

| Country | Region entries | City entries |
|---|---:|---:|
| China | 33 | 75 |
| Russia | 36 | 65 |
| United States | 51 | 187 |

US coverage is all 50 states plus DC. China and Russia are expanded curated regional catalogs, not claims to enumerate every locality or every naming tradition. Russian-language and Tatar variant choices are offered for Tatarstan; China retains explicit Mandarin/Cantonese romanization choices. Regional coverage does not imply one identity for every resident.

## Continent filters

| Filter | Available countries |
|---|---:|
| Africa | 8 |
| Asia | 15 |
| Europe | 13 |
| North America | 3 |
| South America | 5 |
| Oceania | 5 |

Country memberships overlap for transcontinental countries, so this table does not sum to the unique country count. Oceania includes Australia, New Zealand, Fiji, Samoa and Tonga. Antarctica offers McMurdo, Amundsen–Scott, Rothera and Vostok station locations, not a fictitious country or naming culture. Choose each station character’s own background. Antarctic locations are excluded from city-name inference so Adelaide Island cannot accidentally trigger an Australian naming profile.

## Country catalog

| Country | Region entries | City entries | Available country-wide profiles |
|---|---:|---:|---|
| Argentina | 6 | 8 | Spanish-language · Argentina |
| Australia | 8 | 14 | English-language · Australia |
| Bangladesh | 5 | 6 | Bengali-language · Bangladesh |
| Brazil | 13 | 26 | Portuguese-language · Brazil |
| Canada | 13 | 24 | English-language · Canada; French-language · Canada |
| Chile | 5 | 10 | Spanish-language · Chile |
| China | 33 | 75 | Mandarin romanization · Chinese names; Cantonese romanization · Chinese names |
| Colombia | 5 | 5 | Spanish-language · Colombia |
| Egypt | 5 | 5 | Arabic-language · Egypt |
| Ethiopia | 5 | 7 | Amharic-language · Ethiopia |
| Fiji | 4 | 8 | iTaukei short-name variant · Fiji |
| France | 6 | 11 | French · France |
| Germany | 6 | 10 | German-language · Germany |
| Ghana | 5 | 9 | Akan day-name variant · Ghana |
| India | 22 | 49 | Hindi-language · North India; Marathi-language · India; Tamil-language · India; Telugu-language · India; Bengali-language · India; Gujarati-language · India; Punjabi-language · India; Kannada-language · India; Malayalam parental-name variant · India; Urdu-language · India |
| Indonesia | 10 | 16 | Javanese mononym variant · Indonesia; Sundanese multi-part variant · Indonesia; Batak Toba · Indonesia |
| Iran | 6 | 6 | Persian-language · Iran |
| Ireland | 5 | 7 | Irish/English display variant · Ireland |
| Italy | 6 | 10 | Italian-language · Italy |
| Japan | 7 | 10 | Japanese · Japan |
| Kazakhstan | 7 | 9 | Kazakh Russian-form surname variant · Kazakhstan; Russian-language · Russia |
| Kenya | 5 | 5 | Swahili given/parental variant · Kenya |
| Mexico | 8 | 11 | Mexican Spanish · Mexico |
| Morocco | 6 | 13 | Arabic-language · Morocco |
| New Zealand | 6 | 12 | English-language · New Zealand |
| Nigeria | 11 | 15 | Yorùbá · Nigeria; Igbo · Nigeria; Hausa-language · Nigeria |
| Pakistan | 5 | 10 | Urdu-language · Pakistan |
| Peru | 6 | 8 | Spanish-language · Peru |
| Philippines | 5 | 6 | Filipino given/family variant · Philippines |
| Poland | 4 | 4 | Polish-language · Poland |
| Portugal | 5 | 9 | Portuguese-language · Portugal |
| Russia | 36 | 65 | Russian-language · Russia; Tatar Russian-form surname variant · Russia |
| Samoa | 3 | 4 | Samoan short-name variant · Samoa |
| Saudi Arabia | 4 | 6 | Arabic-language · Saudi Arabia |
| South Africa | 6 | 10 | isiZulu-language · South Africa; isiXhosa-language · South Africa; Afrikaans-language · South Africa |
| South Korea | 5 | 7 | Korean · South Korea |
| Spain | 6 | 12 | Spanish-language · Spain; Catalan-language · Spain |
| Sweden | 5 | 8 | Swedish-language · Sweden |
| Tanzania | 5 | 5 | Swahili short-name variant · Tanzania |
| Tonga | 3 | 4 | Tongan short-name variant · Tonga |
| Türkiye | 6 | 6 | Turkish-language · Türkiye |
| Ukraine | 5 | 5 | Ukrainian-language · Ukraine |
| United Kingdom | 4 | 12 | English-language · UK |
| United States | 51 | 187 | English-language · United States; Spanish-language · United States |
| Vietnam | 5 | 5 | Vietnamese-language · Vietnam |

## Naming conventions and limits

- A country is not a culture. Menus offer selected linguistic/display variants, not an inference of ancestry, caste, religion, family status, personality or name-frequency distribution. Cities can share the same linguistic profile. Not every community in each country is represented.
- Name conventions include family-first, multiple family names, multi-word surnames, diacritics, parental-name and mononym variants. Russian, Polish, Tatar and Kazakh inflected variants sample compatible conventional given/family forms. Short display forms may omit legal middle names or patronymics; profile notes explain limits.
- Names relating to kinship, titles, birth weekdays or clan history need deliberate author review. The generator does not construct genealogies, confer status or calculate birthdays. New Pacific/African profiles are small starter examples, not professional cultural-authenticity certifications.
- Places lacking a locally curated naming tradition keep an explicit unsupported-area notice instead of automatically substituting a neighboring tradition. All other profiles and manual names remain available.
- Romanization does not establish native-script spelling or meaning. Historical suggestions remain manual/research-required. Free-text recognition covers the catalog and selected aliases only; ambiguous bare city names require country/region context.
- Place/name generation is local: no geolocation tracking, external geocoding, person lookup or paid generation is used by these controls.

## Sources and maintenance

The design follows the internationalization principles in [W3C: Personal names around the world](https://www.w3.org/International/questions/qa-personal-names), reviewed during the earlier expansion. This is a design reference, **not** verification of each pool entry. The catalog is independently curated application data, not scraped personal records or a professionally audited worldwide names database.

`shared/naming-base.ts` preserves original profiles; `shared/naming.ts` holds added display variants. `shared/places.ts` implements matching, continent filters and station metadata; `shared/places-data.ts` is generated from `scripts/create-places.py`. Run the formatter after regeneration. Tests validate all 754 city-entry round trips, profile references, minimum continent coverage, ambiguous matching, station isolation, name conventions, browser selection/persistence and mobile accessibility checks.
