import { baseProfiles } from "./naming-base.js";
import { countries, matchPlace } from "./places.js";
export type CultureProfile = {
  id: string;
  label: string;
  place: string;
  language: string;
  order: "given-family" | "family-given" | "single";
  given: readonly string[];
  family: readonly string[];
  note: string;
  format?: "two-family";
  nameSets?: readonly { given: readonly string[]; family: readonly string[] }[];
};
const p = (
  id: string,
  label: string,
  place: string,
  language: string,
  given: string,
  family: string,
  extra: Partial<CultureProfile> = {},
): CultureProfile => ({
  id,
  label,
  place,
  language,
  order: "given-family",
  given: given.split("|"),
  family: family ? family.split("|") : [],
  note: "Contemporary starter examples, not population statistics or a rule for every resident. Review personal spelling, family history and preferred display; edit freely.",
  ...extra,
});
const expanded: CultureProfile[] = [
  p(
    "us-en",
    "English-language · United States",
    "Richmond, Virginia, United States",
    "English",
    "Avery|Jordan|Maya|Noah|Elena|Miles|Olivia|Daniel|Grace|Isaiah|Natalie|Caleb",
    "Bennett|Carter|Davis|Morgan|Reed|Brooks|Williams|Hayes|Sullivan|Parker",
  ),
  p(
    "us-es",
    "Spanish-language · United States",
    "San Antonio, Texas, United States",
    "Spanish / English",
    "Sofía|Mateo|Lucía|Diego|Elena|Gabriel|Valeria|Adrián",
    "García|Rivera|Torres|Morales|Reyes|Castillo|Vargas|Mendoza",
    {
      note: "One-family-name display variant for Spanish-language US contexts. Some people use two family names or other arrangements; choose their family background and preferred form explicitly.",
    },
  ),
  p(
    "ca-en",
    "English-language · Canada",
    "Toronto, Ontario, Canada",
    "English",
    "Amelia|Liam|Charlotte|Oliver|Maya|Ethan|Nora|Lucas",
    "Campbell|Wilson|Fraser|Bennett|Reid|Clarke|MacDonald|Stewart",
  ),
  p(
    "ca-fr",
    "French-language · Canada",
    "Montréal, Québec, Canada",
    "French",
    "Émile|Léa|Juliette|Louis|Florence|Antoine|Camille|Gabriel",
    "Tremblay|Gagnon|Roy|Bouchard|Gauthier|Morin|Lavoie|Fortin",
  ),
  p(
    "br",
    "Portuguese-language · Brazil",
    "São Paulo, São Paulo, Brazil",
    "Portuguese",
    "Ana|João|Beatriz|Lucas|Mariana|Rafael|Camila|Gabriel",
    "Silva|Santos|Oliveira|Souza|Pereira|Costa|Almeida|Lima",
    {
      format: "two-family",
      note: "Two-family-name display starter; Brazilian names can include more names and particles. Ordering and inheritance vary; verify the character’s family practice rather than assuming a single national rule.",
    },
  ),
  p(
    "ar-es",
    "Spanish-language · Argentina",
    "Córdoba, Córdoba, Argentina",
    "Spanish",
    "Valentina|Santiago|Martina|Tomás|Lucía|Joaquín|Camila|Nicolás",
    "González|Rodríguez|Fernández|López|Martínez|Pérez|Romero|Sosa",
    {
      note: "Single-family-name display variant; some Argentine people have compound or multiple family names. Regional location does not establish ancestry.",
    },
  ),
  p(
    "co-es",
    "Spanish-language · Colombia",
    "Medellín, Antioquia, Colombia",
    "Spanish",
    "Mariana|Santiago|Valentina|Samuel|Isabella|Daniel|Gabriela|Nicolás",
    "Rodríguez|Gómez|González|Martínez|García|López|Hernández|Ramírez",
    { format: "two-family" },
  ),
  p(
    "cn-mandarin",
    "Mandarin romanization · Chinese names",
    "Beijing, Beijing, China",
    "Mandarin Chinese",
    "Ming|Wei|Mei|Jun|Xinyi|Zihan|Jing|Yuchen",
    "Wang|Li|Zhang|Liu|Chen|Yang|Zhao|Huang",
    {
      order: "family-given",
      note: "Family name first, with a small Hanyu Pinyin starter pool. Romanization alone does not determine characters, meaning or regional dialect. Confirm native-script spelling yourself; China has many languages and naming traditions.",
    },
  ),
  p(
    "cn-cantonese",
    "Cantonese romanization · Chinese names",
    "Guangzhou, Guangdong, China",
    "Cantonese",
    "Ka-yan|Wai-man|Wing-yi|Chi-wai|Ka-ming|Mei-ling|Wai-ting|Ho-yin",
    "Chan|Wong|Lee|Cheung|Lau|Leung|Cheng|Ng",
    {
      order: "family-given",
      note: "Family-first Cantonese romanized display. Spellings vary across families and jurisdictions; a Guangdong setting can also use Mandarin romanization. This is an explicit choice, not automatic transliteration.",
    },
  ),
  p(
    "in-hi",
    "Hindi-language · North India",
    "Lucknow, Uttar Pradesh, India",
    "Hindi",
    "Aarav|Ananya|Arjun|Kavya|Rohan|Meera|Ishaan|Nisha",
    "Sharma|Verma|Gupta|Joshi|Saxena|Mehta|Kapoor|Malhotra",
    {
      note: "Limited contemporary given-plus-family-name variant. India has many languages and naming systems. These surnames are not neutral demographic labels: do not infer caste, religion or character traits from a generated name.",
    },
  ),
  p(
    "in-mr",
    "Marathi-language · India",
    "Pune, Maharashtra, India",
    "Marathi",
    "Aditi|Aditya|Isha|Omkar|Sneha|Siddharth|Madhura|Nikhil",
    "Deshmukh|Kulkarni|Patil|Joshi|Deshpande|Jadhav|Pawar|Shinde",
    {
      note: "Short given-plus-family display; a parent’s name may be included in fuller forms. Do not infer caste, religion or personality from the name; author review is required.",
    },
  ),
  p(
    "in-ta",
    "Tamil-language · India",
    "Chennai, Tamil Nadu, India",
    "Tamil",
    "Kavya|Arun|Revathi|Karthik|Nila|Saravanan|Priya|Meena",
    "Raman|Kumar|Suresh|Murugan|Ravi|Sekar|Mani|Ganesh",
    {
      note: "Given name followed by a parent’s given name in this variant, NOT a hereditary surname. Tamil practices can use initials or different ordering; set the parent/initial and display explicitly for a family. This pool is not all Tamil naming traditions.",
    },
  ),
  p(
    "in-te",
    "Telugu-language · India",
    "Hyderabad, Telangana, India",
    "Telugu",
    "Sravani|Ravi|Anusha|Kiran|Madhavi|Suresh|Harini|Venu",
    "Akkineni|Daggubati|Gottipati|Koneru|Nanduri|Penumatsa|Tummala|Vemuri",
    {
      order: "family-given",
      note: "Family-first Telugu display variant; given-first forms also occur. Surname and regional origin do not imply caste, religion, occupation or personality.",
    },
  ),
  p(
    "in-bn",
    "Bengali-language · India",
    "Kolkata, West Bengal, India",
    "Bengali",
    "Ananya|Arindam|Madhumita|Sayan|Riya|Soumya|Ishita|Subho",
    "Chatterjee|Banerjee|Mukherjee|Das|Sen|Dutta|Bose|Roy",
    {
      note: "One Bengali given-plus-family-name variant, not representative of all Bengali communities. Do not infer caste or religion. Bangladesh has a separate starter profile; family histories can cross borders.",
    },
  ),
  p(
    "in-gu",
    "Gujarati-language · India",
    "Ahmedabad, Gujarat, India",
    "Gujarati",
    "Dhruv|Hiral|Nirav|Kavya|Mihir|Riddhi|Parth|Nisha",
    "Patel|Shah|Mehta|Desai|Trivedi|Joshi|Vyas|Parikh",
    {
      note: "Short display variant; fuller names may include a parent’s name. Do not infer caste, religion or occupation from a surname.",
    },
  ),
  p(
    "in-kn",
    "Kannada-language · India",
    "Bengaluru, Karnataka, India",
    "Kannada",
    "Ananya|Darshan|Divya|Kiran|Kavya|Puneeth|Rashmi|Sanjay",
    "Hegde|Rao|Shetty|Murthy|Gowda|Kulkarni",
    {
      note: "One given-plus-family display variant. Kannada naming also uses parental or place initials. Do not infer caste, religion or occupation; review the character’s family practice.",
    },
  ),
  p(
    "in-ml",
    "Malayalam parental-name variant · India",
    "Kochi, Kerala, India",
    "Malayalam",
    "Anjali|Arun|Devika|Vivek|Meera|Nikhil|Kiran|Priya",
    "Ravi|Rajan|Suresh|Vijayan|Gopal|Mohan",
    {
      note: "Given name plus a parent’s given name in this variant, not a universal inherited surname. House names, initials and religious/community traditions vary widely in Kerala; choose the individual’s practice explicitly.",
    },
  ),
  p(
    "in-pa",
    "Punjabi-language · India",
    "Ludhiana, Punjab, India",
    "Punjabi",
    "Harpreet|Gurpreet|Manpreet|Navdeep|Jaspreet|Simran|Amanpreet|Sukhdeep",
    "Singh|Kaur",
    {
      note: "Singh/Kaur display variant commonly associated with Sikh naming, not all Punjabi identities. Select or edit the appropriate name form for the individual; the random suggestion does not assign gender or religion.",
    },
  ),
  p(
    "in-ur",
    "Urdu-language · India",
    "Hyderabad, Telangana, India",
    "Urdu",
    "Ayesha|Ali|Maryam|Hamza|Zainab|Bilal|Sana|Imran",
    "Khan|Ahmed|Hussain|Rizvi|Siddiqui|Raza|Abbas|Ansari",
    {
      note: "One Urdu-language short-name variant, not all Indian Urdu naming traditions. Second elements may be parental or familial; do not infer religion or ethnicity from where someone lives.",
    },
  ),
  p(
    "pk-ur",
    "Urdu-language · Pakistan",
    "Karachi, Sindh, Pakistan",
    "Urdu",
    "Ayesha|Ali|Maryam|Hamza|Zainab|Bilal|Sana|Usman",
    "Khan|Ahmed|Malik|Hussain|Iqbal|Siddiqui|Raza|Abbas",
    {
      note: "Limited Urdu-language short-name variant. Pakistan includes many languages and naming traditions, and a second element is not necessarily a hereditary surname. Do not infer ethnicity or religion from location.",
    },
  ),
  p(
    "bd-bn",
    "Bengali-language · Bangladesh",
    "Dhaka, Dhaka, Bangladesh",
    "Bengali",
    "Farhana|Arif|Nusrat|Imran|Tasnim|Rafiq|Shirin|Tanvir",
    "Rahman|Ahmed|Hossain|Islam|Chowdhury|Alam|Haque|Karim",
    {
      note: "One common Bengali-language naming variant, not all Bangladeshi communities. These components are not always inherited surnames. Religious/minority naming traditions require explicit author choice and research.",
    },
  ),
  p(
    "id-java",
    "Javanese mononym variant · Indonesia",
    "Yogyakarta, Special Region of Yogyakarta, Indonesia",
    "Javanese / Indonesian",
    "Sari|Dewi|Budi|Rini|Agus|Wati|Sri|Joko",
    "",
    {
      order: "single",
      note: "Single-name variant only. Javanese people also use multi-part names; a last element is not automatically a family name. This does not represent all Indonesian naming traditions.",
    },
  ),
  p(
    "id-sunda",
    "Sundanese multi-part variant · Indonesia",
    "Bandung, West Java, Indonesia",
    "Sundanese / Indonesian",
    "Asep|Dede|Teti|Yayan|Eneng|Cecep|Nining|Yuyun",
    "Supriatna|Suryana|Hidayat|Permana|Kusnadi|Rohman",
    {
      note: "Multi-part Sundanese display starter; the second component need not be an inherited surname. Verify personal and family usage rather than treating it as a universal given/family split.",
    },
  ),
  p(
    "id-batak",
    "Batak Toba · Indonesia",
    "Medan, North Sumatra, Indonesia",
    "Batak Toba / Indonesian",
    "Tiur|Bunga|Horas|Togar|Duma|Ria|Dapot|Ramos",
    "Siregar|Simanjuntak|Hutabarat|Sitompul|Situmorang|Nainggolan",
    {
      note: "Given name plus marga (clan name) in this Batak Toba starter. Family/clan relationships must be set deliberately; random suggestions do not establish kinship. Not representative of all Batak groups.",
    },
  ),
  p(
    "ru",
    "Russian-language · Russia",
    "Moscow, Moscow, Russia",
    "Russian",
    "Anna|Elena|Daria|Sofia|Ivan|Mikhail|Dmitri|Alexei",
    "Ivanov|Petrov|Sokolov|Smirnov",
    {
      note: "Short given-plus-family form, omitting the patronymic. Conventionally masculine/feminine given/surname forms are sampled together to avoid mismatched inflection; edit to the character’s own usage. Not all residents use Russian-language names.",
      nameSets: [
        {
          given: ["Ivan", "Mikhail", "Dmitri", "Alexei"],
          family: ["Ivanov", "Petrov", "Sokolov", "Smirnov"],
        },
        {
          given: ["Anna", "Elena", "Daria", "Sofia"],
          family: ["Ivanova", "Petrova", "Sokolova", "Smirnova"],
        },
      ],
    },
  ),
  p(
    "ng-ig",
    "Igbo · Nigeria",
    "Enugu, Enugu, Nigeria",
    "Igbo",
    "Chidinma|Chinedu|Adaeze|Ifeoma|Chiamaka|Emeka|Obinna|Ngozi",
    "Okafor|Okeke|Okonkwo|Nwosu|Eze|Nwankwo|Umeh|Anyanwu",
    {
      note: "Igbo starter in common diacritic-free display spellings; tonal/native orthography needs review. Nigeria is not one naming culture; do not infer identity from a city alone.",
    },
  ),
  p(
    "ng-ha",
    "Hausa-language · Nigeria",
    "Kano, Kano, Nigeria",
    "Hausa",
    "Amina|Musa|Zainab|Usman|Hadiza|Bashir|Fatima|Ibrahim",
    "Abdullahi|Bello|Sani|Yusuf|Garba|Musa|Ibrahim|Umar",
    {
      note: "Short Hausa-language naming variant; later elements may be parental names rather than hereditary surnames. This is not every northern Nigerian tradition, and the suggestion does not establish religion.",
    },
  ),
  p(
    "et-am",
    "Amharic-language · Ethiopia",
    "Addis Ababa, Addis Ababa, Ethiopia",
    "Amharic",
    "Mekdes|Dawit|Hana|Yonas|Selam|Tadesse|Rahel|Abel",
    "Tesfaye|Bekele|Tadesse|Girma|Alemu|Getachew|Demeke|Mulugeta",
    {
      note: "Given name plus a father’s given name in this short display variant, NOT a shared hereditary surname. Set parent links deliberately. Ethiopia has many other languages and naming traditions.",
    },
  ),
  p(
    "eg-ar",
    "Arabic-language · Egypt",
    "Alexandria, Alexandria, Egypt",
    "Arabic",
    "Mariam|Omar|Salma|Youssef|Nour|Ahmed|Dina|Karim",
    "Hassan|Mansour|Ibrahim|Farouk|Khalil|Fahmy|Naguib|Habib",
    {
      note: "Short Arabic-language display; fuller family/patronymic sequences and transliterations vary. Egyptian names span multiple religious and cultural traditions; location does not choose those for the character.",
    },
  ),
  p(
    "za-zu",
    "isiZulu-language · South Africa",
    "Durban, KwaZulu-Natal, South Africa",
    "isiZulu",
    "Thandiwe|Sipho|Nomusa|Sibusiso|Lindiwe|Bongani|Nokuthula|Themba",
    "Dlamini|Zulu|Mkhize|Khumalo|Ngcobo|Cele|Gumede|Ndlovu",
  ),
  p(
    "za-xh",
    "isiXhosa-language · South Africa",
    "Mthatha, Eastern Cape, South Africa",
    "isiXhosa",
    "Nomsa|Luthando|Zoleka|Siphesihle|Noluthando|Siyabonga|Bulelwa|Andile",
    "Mbeki|Gqubule|Maqoma|Jali|Jolobe|Tyali",
    {
      note: "Small isiXhosa-language starter with family names shared across some communities. Surname alone does not determine language, clan or ethnic identity; review kinship and spelling.",
    },
  ),
  p(
    "za-af",
    "Afrikaans-language · South Africa",
    "Cape Town, Western Cape, South Africa",
    "Afrikaans",
    "Annelie|Pieter|Marisa|Johan|Elize|Willem|Carina|Stefan",
    "Botha|Jacobs|de Villiers|van der Merwe|Pretorius|du Plessis|Adams|Williams",
    {
      note: "Afrikaans-language starter, not a racial identity. Multi-word family names and lowercase particles are preserved.",
    },
  ),
  p(
    "au-en",
    "English-language · Australia",
    "Melbourne, Victoria, Australia",
    "English",
    "Charlotte|Oliver|Amelia|Jack|Isla|Henry|Matilda|Noah",
    "Wilson|Taylor|Brown|Martin|Thompson|Walker|Kelly|Ryan",
  ),
  p(
    "de",
    "German-language · Germany",
    "Hamburg, Hamburg, Germany",
    "German",
    "Hannah|Lukas|Mia|Felix|Clara|Jonas|Emilia|Leon",
    "Müller|Schmidt|Schneider|Fischer|Weber|Meyer|Wagner|Becker",
  ),
  p(
    "it",
    "Italian-language · Italy",
    "Bologna, Emilia-Romagna, Italy",
    "Italian",
    "Giulia|Lorenzo|Sofia|Matteo|Chiara|Alessandro|Elena|Marco",
    "Rossi|Russo|Ferrari|Esposito|Bianchi|Romano|Colombo|Ricci",
  ),
  p(
    "es",
    "Spanish-language · Spain",
    "Seville, Andalusia, Spain",
    "Spanish",
    "Lucía|Hugo|Sofía|Mateo|Elena|Pablo|Carmen|Adrián",
    "García|Fernández|González|Rodríguez|López|Martínez|Sánchez|Pérez",
    { format: "two-family" },
  ),
  p(
    "es-ca",
    "Catalan-language · Spain",
    "Barcelona, Catalonia, Spain",
    "Catalan",
    "Laia|Marc|Núria|Pau|Júlia|Pol|Aina|Oriol",
    "Ferrer|Soler|Vidal|Serra|Puig|Roca|Pujol|Vila",
    {
      format: "two-family",
      note: "Catalan-language two-family-name starter. Particles and conjunctions are personal choices; preserve the character’s chosen spelling. Catalonia is multilingual.",
    },
  ),
  p(
    "tr",
    "Turkish-language · Türkiye",
    "Izmir, Izmir, Türkiye",
    "Turkish",
    "Elif|Deniz|Zeynep|Emre|Ece|Kerem|Selin|Mert",
    "Yılmaz|Kaya|Demir|Şahin|Çelik|Yıldız|Aydın|Arslan",
  ),
  p(
    "ir-fa",
    "Persian-language · Iran",
    "Shiraz, Fars, Iran",
    "Persian",
    "Sara|Reza|Niloofar|Amir|Leila|Arman|Shirin|Kian",
    "Ahmadi|Hosseini|Karimi|Rahimi|Moradi|Jafari|Kazemi|Ebrahimi",
  ),
  p(
    "vn",
    "Vietnamese-language · Vietnam",
    "Hanoi, Hanoi, Vietnam",
    "Vietnamese",
    "Minh Anh|Thùy Linh|Quốc Huy|Ngọc Mai|Tuấn Anh|Thanh Hà|Đức Minh|Bảo Ngọc",
    "Nguyễn|Trần|Lê|Phạm|Hoàng|Huỳnh|Phan|Vũ",
    {
      order: "family-given",
      note: "Family name first; the remaining two-part block preserves a sample middle/given-name sequence. Diacritics matter. Family tradition and preferred address require author review.",
    },
  ),
  p(
    "ph",
    "Filipino given/family variant · Philippines",
    "Quezon City, Metro Manila, Philippines",
    "Filipino / English",
    "Maria|Paolo|Angela|Miguel|Camille|Rafael|Isabel|Gabriel",
    "Santos|Reyes|Cruz|Garcia|Mendoza|Torres|Ramos|Dela Cruz",
    {
      note: "Short given-plus-family display. A full legal name may include a maternal family name as the middle name, not another given name. This is not every Philippine naming tradition.",
    },
  ),
  p(
    "pl",
    "Polish-language · Poland",
    "Kraków, Lesser Poland, Poland",
    "Polish",
    "Anna|Zofia|Julia|Maja|Jan|Piotr|Jakub|Michał",
    "Kowalski|Wiśniewski|Zieliński|Kamiński",
    {
      nameSets: [
        {
          given: ["Jan", "Piotr", "Jakub", "Michał"],
          family: ["Kowalski", "Wiśniewski", "Zieliński", "Kamiński"],
        },
        {
          given: ["Anna", "Zofia", "Julia", "Maja"],
          family: ["Kowalska", "Wiśniewska", "Zielińska", "Kamińska"],
        },
      ],
      note: "Conventionally masculine/feminine inflected forms are sampled together. This is a short display variant; preserve the individual’s own usage and diacritics.",
    },
  ),
  p(
    "ua",
    "Ukrainian-language · Ukraine",
    "Kyiv, Kyiv, Ukraine",
    "Ukrainian",
    "Olena|Andrii|Kateryna|Dmytro|Oksana|Maksym|Iryna|Bohdan",
    "Shevchenko|Melnyk|Kovalenko|Bondarenko|Tkachenko|Kravchenko|Savchenko|Koval",
    {
      note: "Romanized short form with invariant surname examples; patronymics are omitted. Verify Ukrainian spelling and the individual’s preferred transliteration.",
    },
  ),
  p(
    "ke-sw",
    "Swahili given/parental variant · Kenya",
    "Mombasa, Mombasa, Kenya",
    "Swahili",
    "Amina|Juma|Asha|Hassan|Zainab|Ali|Salma|Omar",
    "Hassan|Ali|Abdalla|Mohamed|Omar|Said|Bakari|Salim",
    {
      note: "One coastal Swahili-language short-name variant; the second name may be parental rather than an inherited surname. Kenya has many other naming traditions; do not use this as a universal Kenyan profile.",
    },
  ),
  p(
    "sa-ar",
    "Arabic-language · Saudi Arabia",
    "Jeddah, Makkah, Saudi Arabia",
    "Arabic",
    "Noura|Abdullah|Hessa|Faisal|Maha|Khalid|Reem|Saud",
    "Al-Harbi|Al-Qahtani|Al-Otaibi|Al-Ghamdi|Al-Zahrani|Al-Dosari",
    {
      note: "Short given-plus-family display, not a complete patronymic genealogy. Family/tribal relationships and transliteration must be set deliberately; no traits should be inferred from a name.",
    },
  ),
  p(
    "nz-en",
    "English-language · New Zealand",
    "Wellington, Wellington, New Zealand",
    "English",
    "Amelia|Oliver|Isla|Jack|Charlotte|Leo|Sophie|Thomas",
    "Wilson|Taylor|Campbell|Robertson|Walker|Thompson|King|Anderson",
    {
      note: "English-language starter only, not a substitute for Māori or Pasifika naming traditions. Choose the individual’s language, family history and preferred display explicitly.",
    },
  ),
  p(
    "fj-it",
    "iTaukei short-name variant · Fiji",
    "Suva, Central Division, Fiji",
    "Fijian / English",
    "Jone|Mere|Ana|Pita|Meli|Sera|Litia|Josua",
    "Tuisova|Koroibete|Nakarawa|Vunivalu|Ravouvou|Vatubua",
    {
      note: "Small iTaukei given-plus-family display starter. Do not infer chiefly status, clan or kinship from it; titles are not generated. Fiji also has Indo-Fijian and other naming traditions requiring a separate author choice.",
    },
  ),
  p(
    "ws",
    "Samoan short-name variant · Samoa",
    "Apia, Tuamasaga, Samoa",
    "Samoan",
    "Sina|Tavita|Lagi|Ioane|Malia|Tala|Fetu|Litia",
    "Leota|Savea|Tuilagi|Faumuina|Tuala|Aiono",
    {
      note: "Limited given-plus-family display variant. Names can intersect with family and title traditions; no matai title or status is assigned by this generator. Verify family connections, spelling, macrons and glottal stops with research.",
    },
  ),
  p(
    "to",
    "Tongan short-name variant · Tonga",
    "Nukuʻalofa, Tongatapu, Tonga",
    "Tongan",
    "Sione|Mele|Siaosi|Ana|Malia|Pita|Sālote|Viliame",
    "Tupou|Fonua|Moala|Finau|Fifita|Latu|Vea|Tuipulotu",
    {
      note: "Small given-plus-family display starter. It does not establish chiefly or royal ancestry. Preserve the individual’s chosen orthography and research family/title relationships separately.",
    },
  ),
  p(
    "cl-es",
    "Spanish-language · Chile",
    "Santiago, Santiago Metropolitan Region, Chile",
    "Spanish",
    "Antonia|Benjamín|Javiera|Vicente|Catalina|Matías|Isidora|Tomás",
    "González|Muñoz|Rojas|Díaz|Pérez|Soto|Contreras|Silva",
    {
      format: "two-family",
      note: "Two-family-name Spanish-language starter, not a substitute for Mapuche or other Indigenous naming traditions. Order and personal display should follow the chosen family history.",
    },
  ),
  p(
    "pe-es",
    "Spanish-language · Peru",
    "Arequipa, Arequipa, Peru",
    "Spanish",
    "Valeria|Diego|Camila|Sebastián|Lucía|Adrián|Daniela|Alonso",
    "García|Flores|Sánchez|Rodríguez|Rojas|Torres|Vargas|Castillo",
    {
      format: "two-family",
      note: "Spanish-language two-family-name variant only. Peru also has Quechua, Aymara and other naming traditions; region alone does not select a person’s language or identity.",
    },
  ),
  p(
    "gh-ak",
    "Akan day-name variant · Ghana",
    "Kumasi, Ashanti, Ghana",
    "Akan",
    "Kofi|Kwame|Kwabena|Kwaku|Ama|Akua|Abena|Adwoa",
    "Mensah|Boateng|Owusu|Osei|Asante|Addo|Opoku|Agyeman",
    {
      note: "Limited Akan day-name plus family-name variant. These given names relate to birth weekdays; set the character’s birthday consistently or replace the name. The generator does not calculate birth dates. Ghana has many other naming traditions.",
    },
  ),
  p(
    "ma-ar",
    "Arabic-language · Morocco",
    "Rabat, Rabat-Salé-Kénitra, Morocco",
    "Moroccan Arabic",
    "Salma|Youssef|Imane|Amine|Nadia|Mehdi|Hajar|Yassine",
    "Benali|Bennani|El Amrani|Alaoui|Idrissi|Mansouri|Bouzid|Bensalem",
    {
      note: "Short Arabic-language display with selected romanizations. It does not stand in for all Amazigh, Jewish or other Moroccan naming traditions. Multi-word family names are preserved; ancestry and family status are not inferred.",
    },
  ),
  p(
    "tz-sw",
    "Swahili short-name variant · Tanzania",
    "Dar es Salaam, Dar es Salaam, Tanzania",
    "Swahili",
    "Asha|Juma|Rehema|Hamisi|Zawadi|Baraka|Neema|Salim",
    "Hassan|Ali|Said|Abdalla|Bakari|Salum|Omar|Juma",
    {
      note: "One Swahili-language given/parental-name variant, not a universal Tanzanian surname system. Set family relationships and additional names explicitly; many other languages and traditions are present.",
    },
  ),
  p(
    "pt",
    "Portuguese-language · Portugal",
    "Porto, Porto District, Portugal",
    "Portuguese",
    "Inês|João|Leonor|Miguel|Matilde|Tiago|Beatriz|Afonso",
    "Silva|Santos|Ferreira|Pereira|Oliveira|Costa|Rodrigues|Martins",
    {
      format: "two-family",
      note: "Two-family-name short display variant. Full names can contain additional given/family names and particles; do not assume one fixed inheritance order for every family.",
    },
  ),
  p(
    "ie",
    "Irish/English display variant · Ireland",
    "Galway, County Galway, Ireland",
    "Irish / English",
    "Niamh|Aoife|Ciara|Saoirse|Cian|Eoin|Seán|Dara",
    "Murphy|Kelly|Walsh|Byrne|Ryan|O’Connor|O’Brien|O’Neill",
    {
      note: "Selected Irish given names with common anglicized family forms. Irish-language family forms and gendered prefixes require separate review rather than automatic conversion.",
    },
  ),
  p(
    "sv",
    "Swedish-language · Sweden",
    "Stockholm, Stockholm County, Sweden",
    "Swedish",
    "Astrid|Elias|Alma|William|Elsa|Hugo|Freja|Oscar",
    "Andersson|Johansson|Karlsson|Nilsson|Eriksson|Larsson|Lindberg|Bergström",
    {
      note: "Contemporary Swedish-language given-plus-family display. Inherited -son surnames do not establish the current parent’s given name; this is not Sámi or every other tradition in Sweden.",
    },
  ),
  p(
    "kz",
    "Kazakh Russian-form surname variant · Kazakhstan",
    "Almaty, Almaty, Kazakhstan",
    "Kazakh",
    "Azamat|Dias|Timur|Arman|Aigerim|Dana|Aruzhan|Zarina",
    "Sadykov|Omarov|Serikov|Akhmetov",
    {
      nameSets: [
        {
          given: ["Azamat", "Dias", "Timur", "Arman"],
          family: ["Sadykov", "Omarov", "Serikov", "Akhmetov"],
        },
        {
          given: ["Aigerim", "Dana", "Aruzhan", "Zarina"],
          family: ["Sadykova", "Omarova", "Serikova", "Akhmetova"],
        },
      ],
      note: "One Kazakh short-name variant using Russian-form inflected surnames, sampled with compatible conventional given-name forms. Other Kazakh name systems and native-script spellings require explicit choice; patronymics are omitted.",
    },
  ),
  p(
    "ru-tt",
    "Tatar Russian-form surname variant · Russia",
    "Kazan, Tatarstan, Russia",
    "Tatar",
    "Aidar|Ildar|Timur|Marat|Aigul|Alsu|Gulnara|Leysan",
    "Galiyev|Safiullin|Khakimov|Valiyev",
    {
      nameSets: [
        {
          given: ["Aidar", "Ildar", "Timur", "Marat"],
          family: ["Galiyev", "Safiullin", "Khakimov", "Valiyev"],
        },
        {
          given: ["Aigul", "Alsu", "Gulnara", "Leysan"],
          family: ["Galiyeva", "Safiullina", "Khakimova", "Valiyeva"],
        },
      ],
      note: "Limited Tatar short-name variant with compatible Russian-form inflected surnames. Romanization and naming practices vary; this does not represent every community in Tatarstan or elsewhere in Russia. Patronymics are omitted.",
    },
  ),
];
export const cultureProfiles: readonly CultureProfile[] = [
  ...baseProfiles.filter((p) => p.id !== "custom"),
  ...expanded,
  ...baseProfiles.filter((p) => p.id === "custom"),
];
export function locationSuggestions(location: string): string[] {
  const match = matchPlace(location);
  if (!match) return [];
  const country = countries.find((c) => c.id === match.countryId)!;
  const region = country.regions.find((r) => r.name === match.region);
  return [...(region?.profiles || country.profiles)];
}
// Backward-compatible single suggestion; ambiguous places require explicit choice.
export function locationProfile(location: string): string | null {
  const profiles = locationSuggestions(location);
  return profiles.length === 1 ? profiles[0] : null;
}
