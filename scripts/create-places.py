# Maintainer source for the curated place catalog; no network fetches or population claims.
import json
from pathlib import Path
countries=[]
def country(id,name,profiles,rows,aliases=[]):
 regions=[]
 for row in rows.strip().split('\n'):
  parts=row.strip().split('|');region,cities=parts[:2]
  regions.append({'name':region,'cities':cities.split(';'),**({'profiles':parts[2].split(',') if parts[2] else []} if len(parts)>2 else {})})
 countries.append({'id':id,'name':name,'aliases':aliases,'profiles':profiles.split(','),'regions':regions})
country('US','United States','us-en,us-es','''
Alabama|Birmingham;Montgomery
Alaska|Anchorage;Fairbanks
Arizona|Phoenix;Tucson
Arkansas|Little Rock;Fayetteville
California|Los Angeles;San Francisco;San Diego;Sacramento|us-en,us-es
Colorado|Denver;Colorado Springs
Connecticut|Hartford;New Haven
Delaware|Wilmington;Dover
District of Columbia|Washington
Florida|Miami;Orlando;Tampa;Jacksonville|us-en,us-es
Georgia|Atlanta;Savannah
Hawaii|Honolulu;Hilo|
Idaho|Boise;Idaho Falls
Illinois|Chicago;Springfield
Indiana|Indianapolis;Fort Wayne
Iowa|Des Moines;Cedar Rapids
Kansas|Wichita;Topeka
Kentucky|Louisville;Lexington
Louisiana|New Orleans;Baton Rouge
Maine|Portland;Augusta
Maryland|Baltimore;Annapolis
Massachusetts|Boston;Worcester
Michigan|Detroit;Grand Rapids
Minnesota|Minneapolis;Saint Paul
Mississippi|Jackson;Gulfport
Missouri|Kansas City;St. Louis
Montana|Billings;Missoula
Nebraska|Omaha;Lincoln
Nevada|Las Vegas;Reno
New Hampshire|Manchester;Concord
New Jersey|Newark;Jersey City
New Mexico|Albuquerque;Santa Fe|us-en,us-es
New York|New York City;Buffalo;Albany|us-en,us-es
North Carolina|Charlotte;Raleigh
North Dakota|Fargo;Bismarck
Ohio|Columbus;Cleveland;Cincinnati
Oklahoma|Oklahoma City;Tulsa
Oregon|Portland;Eugene
Pennsylvania|Philadelphia;Pittsburgh
Rhode Island|Providence;Newport
South Carolina|Charleston;Columbia
South Dakota|Sioux Falls;Rapid City
Tennessee|Nashville;Memphis
Texas|Houston;Austin;Dallas;San Antonio|us-en,us-es
Utah|Salt Lake City;Provo
Vermont|Burlington;Montpelier
Virginia|Virginia Beach;Richmond;Norfolk;Charlottesville|us-en
Washington|Seattle;Spokane
West Virginia|Charleston;Morgantown
Wisconsin|Milwaukee;Madison
Wyoming|Cheyenne;Casper
''',['USA','U.S.A.','United States of America'])
country('CA','Canada','ca-en,ca-fr','''
Alberta|Calgary;Edmonton|ca-en
British Columbia|Vancouver;Victoria|ca-en
Manitoba|Winnipeg;Brandon|ca-en
New Brunswick|Moncton;Fredericton|ca-en,ca-fr
Newfoundland and Labrador|St. John’s;Corner Brook|ca-en
Northwest Territories|Yellowknife|
Nova Scotia|Halifax;Sydney|ca-en
Nunavut|Iqaluit|
Ontario|Toronto;Ottawa;London|ca-en,ca-fr
Prince Edward Island|Charlottetown|ca-en
Québec|Montréal;Québec City;Sherbrooke|ca-fr,ca-en
Saskatchewan|Saskatoon;Regina|ca-en
Yukon|Whitehorse|
''')
country('MX','Mexico','mx','''
Mexico City|Mexico City
Jalisco|Guadalajara;Puerto Vallarta
Nuevo León|Monterrey
Oaxaca|Oaxaca de Juárez
Yucatán|Mérida
Baja California|Tijuana;Ensenada
Puebla|Puebla
Veracruz|Veracruz;Xalapa
''',['México'])
country('BR','Brazil','br','''
São Paulo|São Paulo;Campinas;Santos
Rio de Janeiro|Rio de Janeiro;Niterói
Minas Gerais|Belo Horizonte;Uberlândia
Bahia|Salvador;Feira de Santana
Pernambuco|Recife;Olinda
Ceará|Fortaleza;Juazeiro do Norte
Paraná|Curitiba;Londrina
Rio Grande do Sul|Porto Alegre;Caxias do Sul
Santa Catarina|Florianópolis;Joinville
Amazonas|Manaus;Parintins
Pará|Belém;Santarém
Federal District|Brasília
Goiás|Goiânia;Anápolis
''',['Brasil'])
country('AR','Argentina','ar-es','''
Buenos Aires City|Buenos Aires
Buenos Aires Province|La Plata;Mar del Plata
Córdoba|Córdoba
Santa Fe|Rosario;Santa Fe
Mendoza|Mendoza
Tucumán|San Miguel de Tucumán
''')
country('CO','Colombia','co-es','''
Bogotá Capital District|Bogotá
Antioquia|Medellín
Valle del Cauca|Cali
Atlántico|Barranquilla
Bolívar|Cartagena
''')
country('CN','China','cn-mandarin,cn-cantonese','''
Beijing|Beijing|cn-mandarin
Shanghai|Shanghai|cn-mandarin
Guangdong|Guangzhou;Shenzhen;Foshan|cn-cantonese,cn-mandarin
Sichuan|Chengdu;Mianyang|cn-mandarin
Zhejiang|Hangzhou;Ningbo|cn-mandarin
Jiangsu|Nanjing;Suzhou|cn-mandarin
Hubei|Wuhan|cn-mandarin
Hunan|Changsha|cn-mandarin
Shandong|Jinan;Qingdao|cn-mandarin
Henan|Zhengzhou;Luoyang|cn-mandarin
Shaanxi|Xi’an|cn-mandarin
Fujian|Fuzhou;Xiamen|
Yunnan|Kunming;Dali|cn-mandarin
Heilongjiang|Harbin|cn-mandarin
Liaoning|Shenyang;Dalian|cn-mandarin
Chongqing|Chongqing|cn-mandarin
Hong Kong|Hong Kong|cn-cantonese,cn-mandarin
Xinjiang|Ürümqi;Kashgar|
Inner Mongolia|Hohhot;Baotou|
Tibet|Lhasa|
''',['PRC','中国'])
country('IN','India','in-hi,in-mr,in-ta,in-te,in-bn,in-gu,in-pa,in-kn,in-ml,in-ur','''
Delhi|New Delhi;Delhi|in-hi
Maharashtra|Mumbai;Pune;Nagpur|in-mr,in-hi
Tamil Nadu|Chennai;Coimbatore;Madurai|in-ta
Telangana|Hyderabad;Warangal|in-te,in-ur
Andhra Pradesh|Visakhapatnam;Vijayawada|in-te
Karnataka|Bengaluru;Mysuru;Mangaluru|in-kn
Kerala|Kochi;Thiruvananthapuram;Kozhikode|in-ml
West Bengal|Kolkata;Siliguri|in-bn
Gujarat|Ahmedabad;Surat;Vadodara|in-gu
Punjab|Ludhiana;Amritsar|in-pa
Chandigarh|Chandigarh|in-hi,in-pa
Uttar Pradesh|Lucknow;Varanasi;Kanpur|in-hi
Rajasthan|Jaipur;Jodhpur|in-hi
Madhya Pradesh|Bhopal;Indore|in-hi
Bihar|Patna;Gaya|in-hi
Haryana|Gurugram;Faridabad|in-hi,in-pa
Uttarakhand|Dehradun;Haridwar|in-hi
Goa|Panaji;Margao|
Assam|Guwahati;Dibrugarh|
Odisha|Bhubaneswar;Cuttack|
Jharkhand|Ranchi;Jamshedpur|in-hi
Himachal Pradesh|Shimla;Dharamshala|in-hi
''',['Bharat','भारत'])
country('PK','Pakistan','pk-ur','''
Sindh|Karachi;Hyderabad|pk-ur
Punjab|Lahore;Faisalabad;Rawalpindi|pk-ur
Islamabad Capital Territory|Islamabad|pk-ur
Khyber Pakhtunkhwa|Peshawar;Abbottabad|
Balochistan|Quetta;Gwadar|
''')
country('BD','Bangladesh','bd-bn','''
Dhaka|Dhaka
Chattogram|Chattogram;Cox’s Bazar
Khulna|Khulna
Rajshahi|Rajshahi
Sylhet|Sylhet
''')
country('ID','Indonesia','id-java,id-sunda,id-batak','''
Jakarta|Jakarta|id-java,id-sunda
West Java|Bandung;Bogor|id-sunda
Central Java|Semarang;Surakarta|id-java
East Java|Surabaya;Malang|id-java
Special Region of Yogyakarta|Yogyakarta|id-java
North Sumatra|Medan;Pematangsiantar|id-batak
Bali|Denpasar;Ubud|
South Sulawesi|Makassar|
West Sumatra|Padang|
East Kalimantan|Samarinda;Balikpapan|
''')
country('RU','Russia','ru','''
Moscow|Moscow
Saint Petersburg|Saint Petersburg
Novosibirsk Oblast|Novosibirsk
Sverdlovsk Oblast|Yekaterinburg
Krasnodar Krai|Krasnodar;Sochi
Primorsky Krai|Vladivostok
Irkutsk Oblast|Irkutsk
Tatarstan|Kazan|
Sakha Republic|Yakutsk|
''',['Russian Federation'])
country('NG','Nigeria','yo,ng-ig,ng-ha','''
Lagos|Lagos;Ikeja|yo,ng-ig,ng-ha
Oyo|Ibadan|yo
Ogun|Abeokuta|yo
Osun|Ile-Ife;Osogbo|yo
Enugu|Enugu|ng-ig
Anambra|Awka;Onitsha|ng-ig
Imo|Owerri|ng-ig
Kano|Kano|ng-ha
Kaduna|Kaduna;Zaria|ng-ha
Federal Capital Territory|Abuja|yo,ng-ig,ng-ha
Rivers|Port Harcourt|
''')
country('ET','Ethiopia','et-am','''
Addis Ababa|Addis Ababa|et-am
Amhara|Bahir Dar;Gondar|et-am
Oromia|Adama;Jimma|
Tigray|Mekelle|
Dire Dawa|Dire Dawa|
''')
country('EG','Egypt','eg-ar','''
Cairo|Cairo
Alexandria|Alexandria
Giza|Giza
Luxor|Luxor
Aswan|Aswan
''')
country('ZA','South Africa','za-zu,za-xh,za-af','''
KwaZulu-Natal|Durban;Pietermaritzburg|za-zu
Eastern Cape|Mthatha;Gqeberha|za-xh
Western Cape|Cape Town;Stellenbosch|za-af,za-xh
Gauteng|Johannesburg;Pretoria|za-zu,za-af
Free State|Bloemfontein|
Limpopo|Polokwane|
''')
country('AU','Australia','au-en','''
New South Wales|Sydney;Newcastle
Victoria|Melbourne;Geelong
Queensland|Brisbane;Cairns
Western Australia|Perth;Fremantle
South Australia|Adelaide
Tasmania|Hobart;Launceston
Australian Capital Territory|Canberra
Northern Territory|Darwin;Alice Springs
''')
country('GB','United Kingdom','en','''
England|London;Bristol;Manchester;Birmingham;Liverpool
Scotland|Edinburgh;Glasgow;Aberdeen
Wales|Cardiff;Swansea
Northern Ireland|Belfast;Derry
''',['UK','Britain','Great Britain'])
country('FR','France','fr','''
Île-de-France|Paris;Versailles
Auvergne-Rhône-Alpes|Lyon;Grenoble
Provence-Alpes-Côte d’Azur|Marseille;Nice
Occitanie|Toulouse;Montpellier
Nouvelle-Aquitaine|Bordeaux
Brittany|Rennes;Brest
''')
country('DE','Germany','de','''
Berlin|Berlin
Bavaria|Munich;Nuremberg
Hamburg|Hamburg
Hesse|Frankfurt;Wiesbaden
North Rhine-Westphalia|Cologne;Düsseldorf
Saxony|Dresden;Leipzig
''',['Deutschland'])
country('IT','Italy','it','''
Lazio|Rome
Lombardy|Milan;Bergamo
Campania|Naples
Tuscany|Florence;Pisa
Emilia-Romagna|Bologna;Parma
Sicily|Palermo;Catania
''',['Italia'])
country('ES','Spain','es,es-ca','''
Community of Madrid|Madrid|es
Catalonia|Barcelona;Girona|es-ca,es
Andalusia|Seville;Málaga;Granada|es
Valencian Community|Valencia;Alicante|es,es-ca
Galicia|A Coruña;Vigo|
Basque Country|Bilbao;San Sebastián|
''',['España'])
country('TR','Türkiye','tr','''
Istanbul|Istanbul
Ankara|Ankara
Izmir|Izmir
Antalya|Antalya
Bursa|Bursa
Diyarbakır|Diyarbakır|
''',['Turkey'])
country('IR','Iran','ir-fa','''
Tehran|Tehran
Fars|Shiraz
Isfahan|Isfahan
Razavi Khorasan|Mashhad
East Azerbaijan|Tabriz|
Khuzestan|Ahvaz|
''')
country('JP','Japan','ja','''
Tokyo|Tokyo
Kyoto|Kyoto
Osaka|Osaka
Hokkaido|Sapporo;Hakodate
Fukuoka|Fukuoka;Kitakyushu
Aichi|Nagoya
Kanagawa|Yokohama;Kamakura
''')
country('KR','South Korea','ko','''
Seoul|Seoul
Busan|Busan
Incheon|Incheon
Gyeonggi|Suwon;Seongnam
Jeju|Jeju City;Seogwipo
''',['Republic of Korea'])
country('VN','Vietnam','vn','''
Hanoi|Hanoi
Ho Chi Minh City|Ho Chi Minh City
Da Nang|Da Nang
Hue|Hue
Can Tho|Can Tho
''',['Viet Nam'])
country('PH','Philippines','ph','''
Metro Manila|Manila;Quezon City
Central Visayas|Cebu City
Davao Region|Davao City
Western Visayas|Iloilo City
Cordillera Administrative Region|Baguio
''')
country('PL','Poland','pl','''
Masovia|Warsaw
Lesser Poland|Kraków
Lower Silesia|Wrocław
Pomerania|Gdańsk
''',['Polska'])
country('UA','Ukraine','ua','''
Kyiv|Kyiv
Lviv Oblast|Lviv
Odesa Oblast|Odesa
Kharkiv Oblast|Kharkiv
Dnipropetrovsk Oblast|Dnipro
''')
country('KE','Kenya','ke-sw','''
Mombasa|Mombasa|ke-sw
Lamu|Lamu|ke-sw
Nairobi|Nairobi|
Kisumu|Kisumu|
Nakuru|Nakuru|
''')
country('SA','Saudi Arabia','sa-ar','''
Riyadh|Riyadh
Makkah|Jeddah;Mecca
Madinah|Medina
Eastern Province|Dammam;Al Khobar
''')
country('NZ','New Zealand','nz-en','''
Auckland|Auckland;Manukau
Wellington|Wellington;Lower Hutt
Canterbury|Christchurch;Timaru
Otago|Dunedin;Queenstown
Waikato|Hamilton;Taupō
Bay of Plenty|Tauranga;Rotorua
''',['Aotearoa'])
country('FJ','Fiji','fj-it','''
Central Division|Suva;Nausori
Western Division|Nadi;Lautoka;Ba
Northern Division|Labasa;Savusavu
Eastern Division|Levuka
''')
country('WS','Samoa','ws','''
Tuamasaga|Apia;Afega
Aana|Leulumoega
Fa’asaleleaga|Salelologa
''')
country('TO','Tonga','to','''
Tongatapu|Nukuʻalofa;Muʻa
Vavaʻu|Neiafu
Haʻapai|Pangai
''')
country('CL','Chile','cl-es','''
Santiago Metropolitan Region|Santiago;Puente Alto
Valparaíso|Valparaíso;Viña del Mar
Biobío|Concepción;Talcahuano
Antofagasta|Antofagasta;Calama
Los Lagos|Puerto Montt;Osorno
''')
country('PE','Peru','pe-es','''
Lima|Lima;Huacho
Arequipa|Arequipa
Cusco|Cusco
La Libertad|Trujillo
Piura|Piura;Sullana
Loreto|Iquitos
''')
country('GH','Ghana','gh-ak','''
Ashanti|Kumasi;Obuasi
Eastern Region|Koforidua;Nsawam
Greater Accra|Accra;Tema
Central Region|Cape Coast;Winneba
Northern Region|Tamale|
''')
country('MA','Morocco','ma-ar','''
Casablanca-Settat|Casablanca;Settat
Rabat-Salé-Kénitra|Rabat;Salé;Kénitra
Marrakesh-Safi|Marrakesh;Safi
Fès-Meknès|Fès;Meknès
Tangier-Tetouan-Al Hoceima|Tangier;Tetouan
Souss-Massa|Agadir;Taroudant|
''')
country('TZ','Tanzania','tz-sw','''
Dar es Salaam|Dar es Salaam
Dodoma|Dodoma
Arusha|Arusha
Zanzibar Urban/West|Zanzibar City
Mwanza|Mwanza|
''')
country('PT','Portugal','pt','''
Lisbon District|Lisbon;Sintra
Porto District|Porto;Vila Nova de Gaia
Braga District|Braga;Guimarães
Faro District|Faro;Lagos
Coimbra District|Coimbra
''')
country('IE','Ireland','ie','''
County Dublin|Dublin
County Cork|Cork;Cobh
County Galway|Galway
County Limerick|Limerick
County Kerry|Tralee;Killarney
''')
country('SE','Sweden','sv','''
Stockholm County|Stockholm;Södertälje
Västra Götaland County|Gothenburg;Borås
Skåne County|Malmö;Lund
Uppsala County|Uppsala
Västerbotten County|Umeå
''')
country('KZ','Kazakhstan','kz,ru','''
Astana|Astana
Almaty|Almaty
Shymkent|Shymkent
Karaganda Region|Karaganda;Temirtau
Turkistan Region|Turkistan;Kentau
Atyrau Region|Atyrau
East Kazakhstan Region|Oskemen
''')

# More detailed coverage for the specifically requested large countries.
def add_regions(id,rows):
 c=next(c for c in countries if c['id']==id)
 for row in rows.strip().split('\n'):
  parts=row.strip().split('|'); name,cities=parts[:2]
  assert not any(r['name']==name for r in c['regions']), name
  c['regions'].append({'name':name,'cities':cities.split(';'),**({'profiles':parts[2].split(',') if parts[2] else []} if len(parts)>2 else {})})
add_regions('CN','''
Hebei|Shijiazhuang;Tangshan;Baoding|cn-mandarin
Shanxi|Taiyuan;Datong|cn-mandarin
Anhui|Hefei;Wuhu|cn-mandarin
Jiangxi|Nanchang;Jiujiang|cn-mandarin
Guizhou|Guiyang;Zunyi|cn-mandarin
Hainan|Haikou;Sanya|cn-mandarin
Gansu|Lanzhou;Tianshui|cn-mandarin
Qinghai|Xining;Golmud|
Jilin|Changchun;Jilin City|cn-mandarin
Tianjin|Tianjin|cn-mandarin
Guangxi|Nanning;Guilin|cn-mandarin,cn-cantonese
Ningxia|Yinchuan;Shizuishan|cn-mandarin
Macao|Macao|cn-cantonese,cn-mandarin
''')
add_regions('RU','''
Moscow Oblast|Khimki;Kolomna;Sergiyev Posad
Nizhny Novgorod Oblast|Nizhny Novgorod;Dzerzhinsk
Samara Oblast|Samara;Tolyatti
Rostov Oblast|Rostov-on-Don;Taganrog
Voronezh Oblast|Voronezh;Borisoglebsk
Volgograd Oblast|Volgograd;Volzhsky
Kaliningrad Oblast|Kaliningrad;Sovetsk
Arkhangelsk Oblast|Arkhangelsk;Severodvinsk
Murmansk Oblast|Murmansk;Apatity
Republic of Karelia|Petrozavodsk;Sortavala
Komi Republic|Syktyvkar;Ukhta|
Perm Krai|Perm;Solikamsk
Chelyabinsk Oblast|Chelyabinsk;Magnitogorsk
Tyumen Oblast|Tyumen;Tobolsk
Omsk Oblast|Omsk;Tara
Tomsk Oblast|Tomsk;Seversk
Kemerovo Oblast|Kemerovo;Novokuznetsk
Krasnoyarsk Krai|Krasnoyarsk;Norilsk
Khabarovsk Krai|Khabarovsk;Komsomolsk-on-Amur
Kamchatka Krai|Petropavlovsk-Kamchatsky;Yelizovo
Sakhalin Oblast|Yuzhno-Sakhalinsk;Korsakov
Republic of Buryatia|Ulan-Ude;Severobaykalsk|
Republic of Tuva|Kyzyl|
Altai Republic|Gorno-Altaysk|
Republic of Bashkortostan|Ufa;Sterlitamak|
Republic of Dagestan|Makhachkala;Derbent|
Chechen Republic|Grozny;Gudermes|
''')
ru=next(c for c in countries if c['id']=='RU')
# The default stays Russian-language outside explicit local menus, rather than
# suggesting a Tatar profile for every region after adding it country-wide.
for r in ru['regions']:
 if 'profiles' not in r:r['profiles']=['ru']
ru['profiles']=['ru','ru-tt']
next(r for r in ru['regions'] if r['name']=='Tatarstan')['profiles']=['ru-tt','ru']
next(r for r in ru['regions'] if r['name']=='Tatarstan')['cities']=['Kazan','Naberezhnye Chelny','Almetyevsk']
more_us={
'Alabama':['Huntsville','Mobile'],'Alaska':['Juneau'],'Arizona':['Mesa','Flagstaff'],'Arkansas':['Fort Smith'],
'California':['San Jose','Oakland','Fresno','Long Beach'],'Colorado':['Boulder','Fort Collins'],'Connecticut':['Bridgeport'],
'Delaware':['Newark'],'Florida':['Tallahassee','St. Petersburg','Fort Lauderdale'],'Georgia':['Augusta','Athens'],
'Hawaii':['Kailua-Kona'],'Idaho':['Coeur d’Alene'],'Illinois':['Aurora','Peoria'],'Indiana':['Bloomington'],
'Iowa':['Iowa City'],'Kansas':['Lawrence'],'Kentucky':['Bowling Green'],'Louisiana':['Lafayette','Shreveport'],
'Maine':['Bangor'],'Maryland':['Frederick'],'Massachusetts':['Cambridge','Springfield'],'Michigan':['Ann Arbor','Lansing'],
'Minnesota':['Duluth'],'Mississippi':['Hattiesburg'],'Missouri':['Columbia'],'Montana':['Bozeman'],
'Nebraska':['Bellevue'],'Nevada':['Carson City'],'New Hampshire':['Portsmouth'],'New Jersey':['Trenton','Princeton'],
'New Mexico':['Las Cruces'],'New York':['Rochester','Syracuse','Yonkers'],'North Carolina':['Durham','Asheville'],
'North Dakota':['Grand Forks'],'Ohio':['Dayton','Toledo'],'Oklahoma':['Norman'],'Oregon':['Salem','Bend'],
'Pennsylvania':['Harrisburg','Allentown'],'Rhode Island':['Warwick'],'South Carolina':['Greenville'],
'South Dakota':['Pierre'],'Tennessee':['Knoxville','Chattanooga'],'Texas':['Fort Worth','El Paso','Lubbock'],
'Utah':['Ogden'],'Vermont':['Rutland'],'Virginia':['Alexandria','Roanoke','Newport News'],
'Washington':['Tacoma','Olympia'],'West Virginia':['Huntington'],'Wisconsin':['Green Bay'],'Wyoming':['Laramie']}
for r in next(c for c in countries if c['id']=='US')['regions']:
 r['cities'] += more_us.get(r['name'],[])

more_cn={
'Guangdong':['Dongguan','Zhuhai'],'Jiangsu':['Wuxi','Changzhou'],'Zhejiang':['Wenzhou','Jiaxing'],
'Sichuan':['Leshan','Deyang'],'Shandong':['Yantai','Weifang'],'Hebei':['Qinhuangdao','Chengde'],
'Hubei':['Yichang','Xiangyang'],'Hunan':['Zhuzhou','Hengyang'],'Fujian':['Quanzhou','Zhangzhou']}
for r in next(c for c in countries if c['id']=='CN')['regions']:
 r['cities'] += more_cn.get(r['name'],[])

continent_ids={
'North America':'US CA MX',
'South America':'BR AR CO CL PE',
'Europe':'GB FR DE IT ES PL UA RU TR PT IE SE KZ',
'Africa':'NG ET EG ZA KE GH MA TZ',
'Asia':'CN IN PK BD ID RU TR IR JP KR VN PH SA KZ EG',
'Oceania':'AU NZ FJ WS TO',
}
for c in countries:
 c['continents']=[name for name,ids in continent_ids.items() if c['id'] in ids.split()]
 assert c['continents'], c['name']

# Explicit alias support is maintained separately from display spelling.
Path('shared/places-data.ts').write_text('// Generated by scripts/create-places.py; curated starter geography.\nexport const placeData = '+json.dumps(sorted(countries,key=lambda c:c['name']),ensure_ascii=False,indent=2)+';\n')
print(len(countries),'countries;',sum(len(c['regions']) for c in countries),'regions;',sum(len(r['cities']) for c in countries for r in c['regions']),'city entries')
