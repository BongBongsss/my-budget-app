--
-- PostgreSQL database dump
--

\restrict oEXwsHs3fz3T7lYgqsyn6xbhaw3DB6Mqcf6WTaxLwJiZMmOS3zJ7dZTALdwy04e

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg12+1)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Asset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Asset" (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    memo text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AssetHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AssetHistory" (
    id text NOT NULL,
    "yearMonth" text NOT NULL,
    "totalAssets" double precision NOT NULL,
    "totalLiabilities" double precision NOT NULL,
    "netAssets" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    "groupName" text DEFAULT '湲고?'::text NOT NULL
);


--
-- Name: CategoryGroupRule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CategoryGroupRule" (
    id text NOT NULL,
    "categoryName" text NOT NULL,
    "assignedGroup" text NOT NULL
);


--
-- Name: CategoryRule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CategoryRule" (
    id text NOT NULL,
    keyword text NOT NULL,
    assigned_category text NOT NULL
);


--
-- Name: ExclusionRule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExclusionRule" (
    id text NOT NULL,
    keyword text NOT NULL
);


--
-- Name: IgnoredRule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."IgnoredRule" (
    id text NOT NULL,
    keyword text NOT NULL
);


--
-- Name: PaymentRule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PaymentRule" (
    id text NOT NULL,
    "paymentType" text NOT NULL,
    keyword text NOT NULL
);


--
-- Name: RecurringTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RecurringTransaction" (
    id text NOT NULL,
    vendor text NOT NULL,
    amount double precision NOT NULL,
    category text NOT NULL,
    type text DEFAULT 'expense'::text NOT NULL,
    day_of_month integer NOT NULL
);


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    date text NOT NULL,
    amount double precision NOT NULL,
    vendor text NOT NULL,
    category text NOT NULL,
    type text NOT NULL,
    source text,
    hash text,
    memo text,
    currency text,
    subcategory text,
    "time" text,
    "isVerified" boolean DEFAULT true NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid text NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: Asset; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Asset" (id, name, type, balance, memo, "updatedAt", "createdAt") FROM stdin;
1c80bd5a-e06e-4668-8582-513180ba046e	KB利앷텒	stock	5443252		2026-05-06 01:09:31.53	2026-05-06 06:06:13.186
cb2be2f4-8d6d-48fa-b8a1-df7850afbba0	DB利앷텒	stock	14790334		2026-05-06 01:11:07.079	2026-05-06 06:06:13.186
cfceac11-8faf-40d4-808f-993a22dc2c04	?덈쭏???좎슜?異?liability	264015000		2026-05-06 01:12:39.021	2026-05-06 06:06:13.186
5719895b-7d26-449a-be40-707e175a2329	?좎꽦 ?꾨? ?꾩꽭	realestate	340000000		2026-05-06 01:15:26.641	2026-05-06 06:06:13.186
d790fe9d-d498-4faf-8c40-588515120666	?섏쭊??二쇳깮	realestate	770000000	理쒖큹 留ㅻℓ媛 (?꾩옱 ?꾨━誘몄뾼 ??5?? 媛먰룊媛 5.1??	2026-05-06 01:11:55.887	2026-05-06 06:06:13.186
fca6a7c1-4ebb-4d77-adc4-cee2f0458607	?섎굹????꾩꽭?異?liability	170000000	留뚭린 26??12??2026-05-06 01:13:49.722	2026-05-06 06:06:13.186
b7ab9455-421b-4278-acb8-ae82ea14fa11	?숈뼇?앸챸 ?異뺣낫??insurance	61282694		2026-05-06 01:08:11.065	2026-05-06 06:06:13.186
71c46f06-8bd1-4925-818c-a8af22c94389	???곌툑(?쇱꽦利앷텒 : 媛쒖씤+?댁쭅)	pension	89262267		2026-05-06 01:03:56.739	2026-05-06 06:06:13.186
c86cca13-e0b9-4e72-b6f1-dcd1c098facd	?섏쭊 二쇳깮 ?붿꽭 蹂댁쬆湲?liability	20000000		2026-05-06 01:16:11.632	2026-05-06 06:06:13.186
0b8776ca-4273-4435-a85a-ece1d09e463f	怨듭슜 ?듭옣(移댁뭅?ㅻ콉??	bank	20464761		2026-05-06 01:05:22.085	2026-05-06 06:06:13.186
6d90f30a-1c2b-4d75-9c78-62884516efd0	?덈쭚 ?곌툑?異?pension	1350000	??5留??異??댁쑉 媛먮㈃??	2026-05-06 23:38:37.163	2026-05-06 23:38:37.163
6bd3448d-0224-4600-8da3-529821189774	?섎굹 ?곴툑	bank	1800000	??10留??꾩꽭?異??댁쑉 媛먮㈃??	2026-05-06 23:40:05.015	2026-05-06 23:40:05.015
be3e643a-433b-4228-87ce-6d6817b0113e	?λえ???異?liability	50000000		2026-05-07 03:47:47.298	2026-05-07 03:47:47.298
\.


--
-- Data for Name: AssetHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AssetHistory" (id, "yearMonth", "totalAssets", "totalLiabilities", "netAssets", "createdAt") FROM stdin;
2e32ab97-1c23-4d9f-ba1a-71517d6332cc	2026-05	1304393308	504015000	800378308	2026-05-06 05:11:43.094
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name, "groupName") FROM stdin;
1777013138529湲고?	湲고?	湲고?
479bda73-dfd0-4689-a33b-dbfd16ea4b79	湲덉쑖?섏엯	湲고?
5c2c96c2-29e9-48c1-a708-ba9a2a3d5ded	?댁껜	湲고?
806d9a0e-2844-46a5-ac1e-da5c33f9d7fc	?닿퀎醫뚯씠泥?湲고?
91244913-2dec-43db-8b76-a680f103c6fc	?꾧툑	湲고?
43636fd9-0a7d-4e7f-8521-03498a11e2bc	誘몃텇瑜?湲고?
2d275341-2d81-481f-904b-5a04a21dff1d	移대뱶?湲?湲고?
900e22f0-415e-498a-b4ba-c2f7bb8b3fc2	援먯쑁/?숈뒿	湲고?
31ff3f7d-e567-4fd4-a961-9b8490410038	???좏씎	湲고?
9103508c-6baf-4ff1-8d7e-cfc19f0d6e59	?ъ옄	湲고?
8e1096d5-3ab2-4560-8c6e-0331959a35cf	湲고??섏엯	湲고?
abcb6083-28be-45c4-bdb3-d2510cb95d6b	?ъ뾽?섏엯	湲고?
3fa5252a-d8e8-4599-8d59-b5a6e9308570	?ы뻾/?숇컯	?ы뻾鍮?
6aae873a-9f2b-4150-8bb0-69ab18463eb5	?꾨??섏엯	湲고?
1777013138523臾명솕/?ш?	臾명솕/?ш?	?앺솢鍮?
c115b06e-1afe-40e3-91c3-792af26d9c25	寃쎌“/?좊Ъ	?앺솢鍮?
24296ba8-0eed-4ba6-8ce7-d76825f44046	?앺솢	?앺솢鍮?
0436f1f3-5e4d-4fa3-8fe4-6a7d63823c12	諛섎젮?숇Ъ	?앺솢鍮?
e4d4fa91-66c2-4582-ae6d-ed5e19a35e6b	?異??異쒕퉬??
be43d005-d78d-4295-87c0-cd9a1705c088	?쇳븨	?쇳븨
06354e93-3cae-4e02-aa9f-f56984078bcf	?⑤씪?몄눥???쇳븨
9ab0a424-2533-4670-92af-ecd2fdcaf3c4	?⑥뀡/?쇳븨	?쇳븨
1777013137810?앸퉬	?앸퉬	?앸퉬
8ef112ff-e654-47ba-a4f6-d6c519e95361	移댄럹/媛꾩떇	?앸퉬
cbe13634-64fc-4118-80fb-c8dc00c2a817	?⑸룉	?앺솢鍮?
c15f7333-ea1b-4421-b1b6-b83515793803	?뚯궗移대뱶吏異??뚯궗移대뱶鍮꾩슜
7866956f-1f60-435e-a4ee-ed221cbeb097	?뚯궗移대뱶?뺤궛	?뚯궗移대뱶鍮꾩슜
1777013138507?섎즺/嫄닿컯	?섎즺/嫄닿컯	?섎즺鍮?
2e3b01d7-0c47-4750-b520-6852a37effa1	?異??異?
dbf8fd2d-4fdd-4e60-8178-dca4e298716e	?댁쭅?곌툑	?異?
88966604-ed8d-4a9d-b45c-aa6351981be3	?먮?/?≪븘	?≪븘鍮?
a7adae72-b0e3-4e20-aa58-3ff34ae5d779	湲덉쑖	湲고?
7684e86b-72e4-4bfb-997d-d76f9a367b55	湲됱뿬	?붽툒
c1b21111-4603-477d-9768-2094875a4b6a	?붿꽭	?붿꽭
852e5f1d-dd2d-44c7-8313-f718499f274e	?뚯궗?섎즺鍮꾩????뚯궗?섎즺鍮꾩???
3854bd75-a143-41ba-b944-1f2ec0dd600f	怨듭슜鍮꾩???怨듭슜鍮꾩???
cd79d107-20ff-411e-919e-9254484603c3	酉고떚/誘몄슜	?쇳븨
1777013138455二쇨굅/?듭떊	二쇨굅/?듭떊	?앺솢鍮?
1777013138447援먰넻	援먰넻	?以?援먰넻鍮?
7c4d9c75-90e6-4fbf-ae38-0d7ebf95df4c	?먮룞李??먮룞李??좎?鍮?
\.


--
-- Data for Name: CategoryGroupRule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CategoryGroupRule" (id, "categoryName", "assignedGroup") FROM stdin;
\.


--
-- Data for Name: CategoryRule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CategoryRule" (id, keyword, assigned_category) FROM stdin;
5a915c5d-f273-41a6-a608-18e8cda52014	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬
144b5aef-e8f5-4aba-bb81-2939f844b07f	?곕㉧??吏?섏쿋	援먰넻
c571cc16-3175-48bd-8f38-b5497e57729a	?꾪뙆??愿由щ퉬	二쇨굅/?듭떊
bf91ac4f-32de-40cf-891d-e99dbd250926	寃쎄린?쒕궡踰꾩뒪_?대퉬	援먰넻
b15188a5-b391-4fa9-bece-ec2b40875b90	援ъ떆?꾪뫖?쒕쭏耳??앸퉬
01b88564-e689-4838-8292-458d5b0fcc30	諛붾굹?꾨젅???댄솕?щ???移댄럹/媛꾩떇
df3229b6-88d7-4b14-9933-95f9166320f7	?뚮━諛붽쾶??移댄럹?대???젏	移댄럹/媛꾩떇
66f1f94a-dd5c-4100-9fe4-0548fa0f3e8d	?곕㉧??踰꾩뒪	援먰넻
3b670bdb-533b-4442-8bbe-f3ede6fefcfa	吏?먯뒪(GS)25 ?띾궔?꾨????앸퉬
53ebb6b8-8af4-4f31-bfb7-225800c8be19	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬
fd46d5b1-c129-4434-a0a1-93a4d5202ea0	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊
e48ceab2-c3b1-4bfc-bf6e-5c58a32a8bc0	?숈뼇?앸챸 ?異뺣낫???異?
8d1575f0-c4f6-470d-bb5f-627ddb6bdf07	移댄럹 ?щ옒??移댄럹/媛꾩떇
e736c742-3936-41e0-a330-bb75c6661f95	遺곴꼍諛섏젏	?앸퉬
e967f8b3-bf9b-41c1-9d1f-e11ca98bb60e	(二??곗븘?쒗삎?쒕뱾	?앸퉬
32161d34-53ce-4d7b-a098-33f0bf14755a	?숈뼇?앸챸?異뺣낫???異?
d5f222fd-6410-40bd-a030-d96731b07a0e	?대컲(URBAN)	?⑥뀡/?쇳븨
c80a115f-8aa2-46f0-a7e3-5127bd195fe3	?뚮━諛붽쾶??移댄럹/媛꾩떇
b707b715-9cac-4c5a-bb88-906f23e06f78	?명띁?ㅺ났?앸ぐ	?먮?/?≪븘
8fc7c559-6c26-49e2-861b-e761ee784859	媛먮?移섑궓	?앸퉬
34e1558a-e6f5-492d-96fe-ad0e62a46ea0	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	酉고떚/誘몄슜
5275bc98-60e3-4f6e-b598-a731c791c74f	?ㅽ?踰낆뒪肄붾━??移댄럹/媛꾩떇
354b0bf1-4f43-4a6a-a1f5-21bd46906f17	?꾨??댁긽?붿옱蹂댄뿕(二?蹂몄젏	?먮?/?≪븘
a67b09fe-3c66-44ff-8973-317dfdeeef22	KT?듭떊?붽툑 ?먮룞?⑸?	二쇨굅/?듭떊
30ec7953-52d1-40aa-8b7a-22b109433a75	KT?좎꽑?곹뭹 ?먮룞?⑸?	二쇨굅/?듭떊
eb9b4254-b125-4d4e-acbd-41889e02db75	荑좏뙜?댁툩	?앸퉬
d1fa3955-a4f9-4f94-a5da-e7c94b4760fd	異쒓툑 ?댁뿭	?異?
b870fff5-bfd2-4781-8527-8d7591d28406	?댁쫰?몄뒪 ?곕??숇Ц?뚭????앸퉬
16f8343c-8b1a-4b29-a980-333c3d396d8a	?⑥쑀(CU) ?댄솕SK?붾젅肄ㅺ????앸퉬
d6fb95b5-6aa5-4b6e-864a-5683c30b1ec5	援щ룄?쇱꽌?섎궓二쇱쑀???먮룞李?
87eda29b-27dc-481b-a1d4-5108b2d514e4	??뱀껌怨??앸퉬
bfce60ba-f7eb-4efd-b3d2-2bd1a1cff891	?섎끂?댁쓽?꾩묠	?앸퉬
9c94bf5f-5dd5-4665-9170-d7a50dab2a8b	?뚮━諛붽쾶???곕??댄솕??移댄럹/媛꾩떇
948ca701-2769-48ea-8d61-22f855cd2182	踰뺤썝?됱젙泥?二쇨굅/?듭떊
e027e52e-ae61-4c06-ba26-90e613a1479f	?쒖슱?ㅼ쐞?몄튂怨??섎즺/嫄닿컯
ed0b3926-5256-4dcf-a5da-9e94151f99a8	?섏씠?⑥뒪 異쒗눜洹??먮룞李?
0a70c260-b375-47e8-b889-9a0b7a99abd6	紐⑤컮??踰꾩뒪	援먰넻
9917cb54-9df1-4b73-9a5a-5f76121d3243	紐⑤컮??吏?섏쿋	援먰넻
daa400ba-ea59-4d19-9bd9-e6c018762952	?덈큵?쎄뎅	?섎즺/嫄닿컯
1e614562-37f5-434e-9079-22d341a79705	?쇳듉?뚯븘泥?냼?꾧낵?섏썝	?섎즺/嫄닿컯
9cc4649b-3011-4dbc-bb10-de545636be5c	留덉폆而щ━	?앸퉬
874323a4-e222-457d-ba65-16ea51d72947	?좎뒪?꾨씪???⑤씪?몄눥??
c2caa514-230a-43da-be84-f11909dfecb6	援ш??섏씠癒쇳듃肄붾━???좏븳?뚯궗	?⑤씪?몄눥??
7f8c58b5-31c8-447e-8e7f-ec9c478adaf7	二쇱떇?뚯궗 ?먯뒪???뚯궗移대뱶吏異?
89e7ccfa-1969-4f74-a9c4-409fbbcec4a8	?섎굹?쎄뎅	?섎즺/嫄닿컯
1a87b360-a830-439d-9f69-a1d989b7176b	?꾩궛?щ옉?섏썝	?섎즺/嫄닿컯
a0abf304-a071-4525-bf6c-822fc1e0befa	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬
ad69e404-a232-4a07-a511-1abef70dd35c	醫뗭?怨꾨? ?띾궔???앸퉬
313ca608-7272-4ba0-90f7-7572546bf4fc	?띿뾽?뚯궗踰뺤씤(二??쒖뒪	?앸퉬
4a130094-4f51-4dbd-8f95-2224facbd148	(二??몄쭊二쇱쑀??寃쎌썝吏???먮룞李?
eae9596a-5afc-4e52-9e00-d8e7bf5339fe	?덊뵆?ъ뒪?듭뒪?꾨젅?ㅽ뭾?⑹젏	?앸퉬
5a737d03-160d-4ea9-a62d-c3ea49be90d9	GS25?띾궔?꾨????앸퉬
459aeca1-6657-4a80-9a14-06e1aa0d4225	?곸쿇?ㅽ듃?뚰겕(二??쒗씎??섏씠二쇱쑀???먮룞李?
b3b5ef25-46ef-4f2c-afbb-9456ec2a5fc8	?⑺솕諛?移댄럹/媛꾩떇
048141ae-e62b-49e7-b34f-5301151d91fc	(二??꾨?諛깊솕?먯떊珥뚯젏	?⑥뀡/?쇳븨
4a3b4872-93c3-480c-ae06-24150b630a52	?꾨?諛깊솕??泥쒗샇???⑥뀡/?쇳븨
203ab3a7-0f56-47fc-843d-3281ffe24f99	?깆떛?띿궛臾??먮ℓ???앸퉬
e8b57f19-77c5-4c3f-9728-b30c7b64ae2a	?ㅼ궗?묒빟援??섎즺/嫄닿컯
97cc289e-70dd-4a1b-bdd8-ccae85bdd7eb	?좏겕濡쒕ℓ?깆빱?쇱뺨?쇰땲	移댄럹/媛꾩떇
7583d48e-5110-4f43-afdb-84e6cc7ab2e0	?쒖＜??났	?ы뻾/?숇컯
fbf3c0d9-2d77-4bfc-b522-d7725f1c0988	(二??먯뒪???뚯궗移대뱶吏異?
d83df9fb-7b58-4c63-885b-87cad33ea9a0	?몃쭏吏꾩븘?댁뒪?щ┝?띾궔??移댄럹/媛꾩떇
747b7c51-0ef0-440d-aa01-8b6509715580	?⑹깮媛移쇨뎅???곗꽭?숇Ц?뚭????앸퉬
66cefa9f-d862-412b-a80e-6e26ce1f0cdd	二쇱떇?뚯궗 ?꾨??띿궛	?앸퉬
06f0b2a9-329e-4576-b1d2-7f609f46867b	?좎뒪 釉뚮옖?쒖퐯	?⑤씪?몄눥??
9203446b-df73-4609-bfab-43f0d76728eb	(二??꾩꽦?ㅼ씠???앺솢
711c245b-0ed8-42b2-9d6a-f730e163d2bd	諛곗뒪?⑤씪鍮덉뒪 ?섑궓?꾨꼫痢?spc?ㅽ??뚯궗移대뱶吏異?
0c75c9ee-133f-4c25-8a22-054ba28b7265	怨듦났湲곌?_KPN	二쇨굅/?듭떊
5da83ceb-3eae-4185-8ab4-452a7ba57cc7	?앺긽 ?섎뒳?붿젏	?앸퉬
1618540f-180c-45ea-9e9e-d233a15cd4a0	?몄쇅?섏엯_KICC(李쎄뎄寃곗젣)	二쇨굅/?듭떊
\.


--
-- Data for Name: ExclusionRule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ExclusionRule" (id, keyword) FROM stdin;
684599d3-f32f-4240-bdbf-b1cfb6a1c7a2	?좎뒪諭낇겕 ?듭옣 (?댁껜)
\.


--
-- Data for Name: IgnoredRule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."IgnoredRule" (id, keyword) FROM stdin;
419e3552-2b23-45d3-8e7c-edca9d3cd637	??洹?
800d7a23-bff6-4ad3-b991-e604b57c137b	?낃툑 ?댁뿭
64f39998-f306-454e-8d37-e263d39fa482	?섎굹?듭옣2,3???붿뿬湲??낃툑
\.


--
-- Data for Name: PaymentRule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PaymentRule" (id, "paymentType", keyword) FROM stdin;
df044932-ac19-40d7-ae04-81809b628607	transfer	?먮뱶由쇳넻??
e7bdcb26-1b54-4daa-984f-31e8ec5c7d66	transfer	?⑤씪?몄옄由쎌삁?곴툑
3ce9c85a-27b0-4305-80a2-706eecbf34b2	transfer	?좎뒪諭낇겕 ?듭옣
3d4bfdad-6787-4755-9dfd-5b05d0311749	card	移댁뭅?ㅽ럹??媛꾪렪寃곗젣
161e46fd-7510-4fc6-b59c-ec2d70ba7d9b	card	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣
cfc3241a-ad44-41da-90b8-7586136fb4d7	card	?좎뒪 媛꾪렪寃곗젣
51ab26ca-01ac-4627-81e9-5a838d18fb42	card	SK?명뀛由?뒪 X LOCA
2e34f3be-0fc4-4b4e-a4d7-c0435da25a41	transfer	OK吏좏뀒?ы넻??
c2613dcc-49b0-478f-981d-5f7a888819f9	transfer	?湲덊넻
ddba01b9-7b63-44a1-b9d4-1d7edcc68542	transfer	湲됱뿬 ?섎굹 ?붾났由??곴툑
2c1206fa-0b77-47be-a775-5076e147bfe5	transfer	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣
4607cce4-86a5-4fc2-888d-032fa0f3d5b2	transfer	?몄씠?꾨컯??
dd0d0ae8-1147-4527-947a-eadb3c233f6a	transfer	?낆텧湲덊넻??
c4dfeaeb-ae70-471e-bcef-33716bbc28d4	transfer	移댁뭅?ㅽ럹??癒몃땲
\.


--
-- Data for Name: RecurringTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RecurringTransaction" (id, vendor, amount, category, type, day_of_month) FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Transaction" (id, date, amount, vendor, category, type, source, hash, memo, currency, subcategory, "time", "isVerified") FROM stdin;
3f49df44-618f-4748-9cee-e885d419e83f	2026-02-27	41100	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	c6a1ecb963abaa26cfaf0fc4caa1ebbfdd2f256dc0d06e48ab3a613780422c1a	\N	KRW	諛곕떖	12:07	t
1b4d0fee-75f7-4581-baab-c3ae69b2f312	2026-04-26	1550	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	fc5bb2d3a5c43add769193ecf0d13ad6ba05c0882e1350dbbc4bde05c11b64e6	\N	KRW	?以묎탳??16:37	t
88a4139b-f96b-4a1b-904f-476ec49237b8	2026-04-26	6000	?쒕┝?ㅽ럺?몃읆	臾명솕/?ш?	expense	MULTI Any 移대뱶	5a22c6faf30b133b56eace02990c9915b3d6a96536e4b97c27032dd93bb40a7d	\N	KRW	?꾩꽌	14:12	t
8b939a3d-78ff-4216-8238-3c823238ade1	2026-04-24	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	c408e63031148f71843046a32233895403afb75e86b11e331e628eea0f7655ab	\N	KRW	?以묎탳??15:20	t
56304329-e59f-4611-bd66-c3a7adb22c3c	2026-04-24	302800	?꾪뙆??愿由щ퉬	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	acfbb778a62d0727d51cff1a32092ae8d70e973750bb41b82a8d2b8b604bcc18	\N	KRW	愿由щ퉬	14:23	t
948923f0-f2b7-436e-8ab8-7a26e54da764	2026-04-24	1650	寃쎄린?쒕궡踰꾩뒪_?대퉬	援먰넻	expense	MULTI Any 移대뱶	8aef0b4f03aa2fdb11875f933d7a3fd6866923c108c52c5ca3c440ed762ad848	\N	KRW	?以묎탳??14:19	t
8444636e-e53a-45ce-8cf4-9b43b3933d0d	2026-04-24	5700	援ъ떆?꾪뫖?쒕쭏耳??앸퉬	expense	MULTI Any 移대뱶	cb488bba5227a204d68ef227bfc052c607931e83298783febe7292ca6242ec8f	\N	KRW	?꾩떆?꾩쓬??13:26	t
3a1b4abb-841a-40a2-8dee-5e962bcf19d4	2026-04-23	22200	?⑥젙	?앸퉬	expense	MULTI Any 移대뱶	7d1f53430999c2e36166b308ed759692ddc91a07cc4c1ea120db667ba1c1311d	\N	KRW	?앹옱猷?19:49	t
c467269b-ad2f-42d2-9571-a86dc5ca9181	2026-04-23	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	ba29c899a5c0af168341e3f9fed1fba5dbba45fb02bc6fdd6ed14eb879bde8a1	\N	KRW	?以묎탳??18:25	t
b58b9aea-4322-4e2c-9e9e-ac3a1f03ad64	2026-04-23	1400	諛붾굹?꾨젅???댄솕?щ???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	06f09f857a2e844edafa4c378e8368ef1b0af1e96665fc62d9c5ea519b37771a	\N	KRW	而ㅽ뵾/?뚮즺	16:10	t
bf709275-4768-4c1a-921e-00a6c8da16ae	2026-04-23	3750	?뚮━諛붽쾶??移댄럹?대???젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	b833cc5a9f648fd4e105e22118381fb182a34a8656c94b89994d417e18f9b6ed	\N	KRW	而ㅽ뵾/?뚮즺	16:06	t
d62ef16f-64db-45d9-a900-e71ac441b3b9	2026-04-23	250	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	3d7d1962bf80debb4e70661776a0b2466010a27baef790e0cd63efffaf036afd	\N	KRW	?以묎탳??08:01	t
eed56bfc-25e4-44f0-a648-5200ebf134cd	2026-04-23	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	54bf4e6a6a1b344385558d53637e7d7bd34c1cfd3699f908b8c5afc26f4a9b97	\N	KRW	?以묎탳??07:45	t
2dd033cc-373e-4c29-90c4-8654d2a89251	2026-04-22	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	b0cd4c1a2830c29129cd73de47aecf3b5c7e04d817d32d1b0e4882f40e19cb3f	\N	KRW	?以묎탳??17:14	t
b2af2a62-60d4-423e-afb7-19c9e3f4bb29	2026-04-22	3750	?뚮━諛붽쾶??移댄럹?대???젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	2e538e9ef796d9bf08bbd808cc94362273adecd171df716677056f5b69654f4d	\N	KRW	而ㅽ뵾/?뚮즺	08:41	t
0a1590ab-8ba2-47aa-9e32-69e56f980aed	2026-04-22	350	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	dab4b9c1bb2a4d1df55ff740a3c33fd4be938c7561cb36e9d01d6902d140150e	\N	KRW	?以묎탳??07:44	t
ee597ffb-69f3-46c2-82c6-7b41f07fea7e	2026-04-22	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	ec3fe3f144045e66be626a674816cd594eaf5bb664b75b9bce7dcb5fcb924d62	\N	KRW	?以묎탳??07:30	t
c6dd985c-f772-45f0-972f-09cbe6e6482c	2026-04-29	4000	?뚮━諛붽쾶??移댄럹?대???젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	20fe1a2b53b5de5e66de2bbcba71c860c07dcf3f99aec89a8d08120d2e78e20e	\N	KRW	而ㅽ뵾/?뚮즺	08:37	t
935fbd2d-aa2c-4c84-93f4-ab7ab8501010	2026-04-24	110300	?꾩옄移대뱶鍮??뚯궗移대뱶?뺤궛	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	23714546cda57d645768964e9a0c6593307d5dbd096ca1903cd09b0315935973	3???뚯궗 移대뱶鍮??낃툑	KRW	誘몃텇瑜?02:22	t
5134af67-2bac-4f74-a1c1-b4fdaeaaac17	2026-04-24	213170	蹂댁쬆蹂댄뿕猷뚯텧湲??異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	582536090cb1548c8071b209bbe00b75685f5eec41d6518a95606e637140c4fb	?異쒖뿰??蹂댄뿕猷?KRW	蹂댄뿕	09:25	t
06dbee92-01e3-4f7b-a9f0-e2193be641d8	2026-04-26	1100	寃곗젣_KCP	?⑤씪?몄눥??expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	79ae2b1c0cfb8c057c03dc9de9cc48c1775c1f64dc5925d17b1cc78f706763c1	\N	KRW	?명꽣?룹눥??16:19	t
159971f9-2016-47be-8f6d-3186ffa9c8c2	2026-04-26	56000	?꾨줈硫붿궗 ?섏슦	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	a2e75c7fa4cf1aa52d630ab475d83a49dbc907a6e54c6aac05ab1e68fa19e632	\N	KRW	?묒떇	10:30	t
36dab171-3625-4f1f-b864-06fa7a9eddbf	2026-04-22	2400	吏?먯뒪(GS)25 ?띾궔?꾨????앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	b86adf949fe99412302f38648a69c7ed556e6ff172e6008628af6eff22e42ab8	\N	KRW	?몄쓽??19:43	t
30ec2628-3e29-46fe-b66d-14977a4c6f39	2026-04-25	900	?먰뙋湲?TOSS	移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	2dde8db5953517397fd53d076257fc0e70222327a752f5da0bc27a63dff40015	\N	KRW	湲고?媛꾩떇	16:20	t
c3653a32-09f8-4e2c-acfb-b37727a427bd	2026-04-25	1500	?≫뙆援ъ쑁?꾩쥌?⑹??먯꽱???먮?/?≪븘	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	f36384339104778590cb73e7d6773f483d242f056f6047b671fccf4f65bb76be	\N	KRW	?뚮큵鍮?13:28	t
a8860400-4407-44a4-a57f-9a234cb709f4	2026-04-24	40000	移댁툩8 ?뚮Ⅴ?섏뒪紐곗젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	aefb2dea91955abe389c7c75290b8509738ce5867d13a540371bcde6edad9879	\N	KRW	?쇱떇	12:02	t
7a1f40af-da65-40df-9e70-a38a5fbb8903	2026-04-03	25800	????媛뺣궓???瑜???뚯젏	?뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	aa2d94ab2de9c7490371a3c6946f52b9ad1ae8a1c7864936203d783f5d9b77c5	?뚯궗移대뱶 寃곗젣	KRW	而ㅽ뵾/?뚮즺	11:46	t
478a7838-5410-462a-9772-1effa7c9557b	2026-04-24	19800	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	c08eb347974674dbc6dc3f37e49b2fe007b51f36605168f378161024c84e8a08	\N	KRW	諛곕떖	19:55	t
0e8a2b01-245c-493c-a70c-0e8f1e660f56	2026-04-25	1	?湲덊넻 ?댁옄	湲덉쑖?섏엯	income	?湲덊넻 (?댁껜)	3ca932328977b07061427d6f5efaf15f3f18c188536972f87f547dbbb408889d	\N	KRW	誘몃텇瑜?02:42	t
d21bf005-7a2e-41d6-bcbf-fcf7afe67031	2026-04-25	0	?낆텧湲덊넻???댁옄	湲덉쑖?섏엯	income	?낆텧湲덊넻??(?댁껜)	ad0994d99bc15eb237fa40e5a6cef153d28793ce3e30699ce402f3ee282f72b2	\N	KRW	誘몃텇瑜?05:21	t
a74c0caf-4aaf-4839-9ee3-73397b0d32d7	2026-04-25	2400	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	05f8de94241006fbc551dbcb066ee3dd8a643804d523411969e3965da8f701e8	\N	KRW	?몄쓽??17:50	t
f894ac59-925b-4579-831d-8cddca665e73	2026-04-27	169670	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	e9019064c31f51524b2b760ac5f123a11d8618031c33899ab3423b35fa7fbb17	?곗뒿???꾧린猷?KRW	?꾧린??08:27	t
e544282d-1b16-4359-8f5a-ffea1b0dd397	2026-04-21	18700	?곗꽭??숆탳移섍낵??숇퀝???섎즺/嫄닿컯	expense	?좎꽭怨꾩씠留덊듃 ?쇱꽦移대뱶 SFC 7	ed7d1ec82fb3d4b772c2756dc54765cf95b34300fd7e351548242d4186c179a3	\N	KRW	移섍낵	16:17	t
c00592c8-2ec7-4c01-856b-e1cc9dea4d2d	2026-04-21	13400	?곗꽭??숆탳移섍낵??숇퀝???섎즺/嫄닿컯	expense	MULTI Any 移대뱶	c043bbb8bd850e3260b318eb8364f7cf5b7feb523882ae882f31a41613b8faa1	\N	KRW	移섍낵	14:26	t
449c9e97-67ec-4510-a1cf-46277e5860f0	2026-04-21	10000	硫섏툩猷??앸퉬	expense	MULTI Any 移대뱶	2a83391faed75f5c6ebbf82ddbfee3a1be8e01ade93adc8686ef9f87d5a1248a	\N	KRW	?쇱떇	12:27	t
7c1d4142-540d-4afd-866b-6be599156818	2026-04-21	4000	?뚮━諛붽쾶??移댄럹?대???젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	159d9984a326afb649020b3eb307f5840b8c1fad25082a20c3b40532eb2de156	\N	KRW	而ㅽ뵾/?뚮즺	08:27	t
c83d8c4b-351e-4f63-892b-c183fce7d2b1	2026-02-25	111750	?숈뼇?앸챸 ?異뺣낫???異?expense	?쇱쬆?댁껜	aa6d283a30f0be1e781c316a80b0d9fe05fddf3053604c70e4e2965536584bcc	?⑥?異뺣낫??KRW	?異뺣낫??10:00	t
32e6ddd7-bc0c-4f1a-99e1-7c294dbec250	2026-04-20	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	84ae8a64a9b2e72f990eb30a29772fbbf9751330be17a62fdcaa336cbd09f8ee	\N	KRW	而ㅽ뵾/?뚮즺	14:12	t
21a53af6-565e-47b7-93bd-9321c7f4b5e1	2026-04-19	1650	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	187194daf732b9d6fd6025b57dc172718812e65b002061aade4ec0b03cf90338	\N	KRW	?以묎탳??16:05	t
ff2e6aa9-bb93-442f-a4dc-683f33b07a31	2026-04-22	6840	?섏뒳?ъ퐫由ъ븘 怨듭떇	?⑤씪?몄눥??exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤?? (移대뱶)	01102326eeab84832333b5794e9a1589b87b54202fe572f9098443b3eeff40c9	移대뱶??寃곗젣?좎씤 鍮꾩슜	KRW	?명꽣?룹눥??07:18	t
813406d9-fd25-4904-b57c-041196a4f3f9	2026-04-20	120	?섎굹?듭옣 ?댁옄	湲덉쑖?섏엯	income	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	05ddd5ded61f8990c05eba0a98e900d35fd7db6da407622c2c4e5c0de578f101	\N	KRW	?댁옄	05:50	t
311f2d2f-ac50-4204-98ed-ba1cf8cd8f74	2026-04-19	21000	遺곴꼍諛섏젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	7bdae34668abe1f875012be688193efb8ec73b6cbc8d6b72a548bdd996d22aa7	\N	KRW	以묒떇	18:37	t
d125cfa7-65fd-4ada-8c5a-6ad31b960ae0	2026-04-21	20000	?????紐⑥엫鍮??앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	1928f57bef3935d867037a24c5362061539e8c09ca29cb54badbe4dbfc07dd87	\N	KRW	紐⑥엫鍮?08:21	t
df5ad30d-b4a9-467e-9234-c47c5470db56	2026-04-21	250000	?쇱꽦利앷텒IRP	?댁쭅?곌툑	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	a3c970f1ba92a5a115474f4d79bc62d6f689ae1919d3501f78dafe3399162bf5	\N	KRW	利앷텒/?ъ옄	08:21	t
0f479d89-5675-4ce0-b167-98722040787b	2026-04-21	1000000	?섎굹?붽툒	?닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	223a3cc5fbb56a79281f30f03d191fc21933a9fb0d0aded9a86e0353e8f4f361	?섎굹 ?異??⑹엯??KRW	誘몃텇瑜?08:21	t
1bdcb50d-def0-4a5d-b930-0942ea263393	2026-04-20	63000	?ㅼ꽕湲??섎갚?쇱??댄겕	?앸퉬	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	3d812e7d633f2196f0f8b4d5b72b777367f8722bf683ac1f970773f48fb5995b	??諛깆씪耳?댄겕	KRW	?앸퉬	12:35	t
ddf21b9a-d6d2-4dd2-bb06-eabb9979b2a1	2026-04-21	187140	9301241708882	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	0d70a97d958bd2011c3b759edc1f65648b551997ea5f8d8356cf2db12613478a	?섏쭊 ?異쒖씠??KRW	?異쒖씠??05:05	t
0bb46f12-18d7-4610-a5cb-b16e021357b3	2026-04-21	331910	9301227857505	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	72992f6eafcbd078ff3bf30c0195013713f3102489564b596b50ce2fcd32f48b	?섏쭊 ?異쒖씠??KRW	?異쒖씠??05:05	t
6e2edaba-2d7c-4eea-847c-9b5b8c830a39	2026-04-21	250000	?⑥깮?쒕퉬	?⑸룉	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	82ab9466fdb6859fd19c031020b323a35433c5cacc6eac05b935e423449cf245	\N	KRW	?앺솢鍮?08:21	t
b394b5ce-9e69-4e0a-bd9e-be705c7dcb8e	2026-04-21	1000000	援??앺솢鍮??⑸룉	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	d430beecef70fbb5d54cc5eff916a63039792a9a2883447c27fd1bf38a46c63c	\N	KRW	?앺솢鍮?08:21	t
c269795f-6c31-4ab8-8d4e-69118d1924b7	2026-04-21	5750470	?꾩옄湲됱뿬	湲됱뿬	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	2f57cd5178eb0732836aecda9775e183afbc30fa0eda166e63030e5ea77a8680	\N	KRW	誘몃텇瑜?02:05	t
7a869262-9527-4bbf-ad42-46e9b71b4da9	2026-04-21	500000	?쇱쬆?뺢린?낃툑	?닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	19f89dde71c1bb7c197c50d2c8129fdc6084d7657742d0a78f5116c922048c92	?숈뼇?앸챸 ?곌툑蹂댄뿕	KRW	?곌툑蹂댄뿖	08:21	t
688b89a9-4546-4700-954a-cd0ab02dba8f	2026-04-21	1000000	100留?紐⑥쑝湲??異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	8909fab5c08373bbe6b9913959ea1ca9d046aabe528957f7c984f81adb725a21	移대콉 ?異?KRW	?異?08:21	t
ae26606e-2f87-4cb6-9f29-0ef11947af44	2026-04-21	100000	?λえ?섏씠???異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	348006fc2ff34d2cf688747a568b76b76cacf99ceefb01220a71eee562fb9278	?λえ???꾩꽭?異?KRW	?異쒖씠??08:21	t
77eaee5b-0519-4421-b6bc-a93b56999061	2026-04-22	129960	?섏뒳?ъ퐫由ъ븘 怨듭떇	?⑤씪?몄눥??expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	143c23dc3220ec0e40b039cecf701707e25f876a430d7c3451d113e85e7c3359	\N	KRW	?명꽣?룹눥??07:18	t
a3a82fa7-405b-407f-bde2-40b008b162a2	2026-04-20	1990	(二??곗븘?쒗삎?쒕뱾	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	a498a58d8327f0ae363e07f7d95df684649091efc5617aa87a91849d6a75ef49	\N	KRW	諛곕떖	09:28	t
fc1c137b-8c00-4c94-b4fe-27d3904eca68	2026-04-20	23400	?쒖뵪?ㅼ뼱??酉고떚/誘몄슜	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	1c3b49744c44ad74408048a1b1ab9d7015f55a8380a792009ff2ede5b279cc93	\N	KRW	?ㅼ뼱??08:47	t
70771d1f-6c4b-43d2-88a6-95e97f51b3c5	2026-04-22	100000	28491049758421	?닿퀎醫뚯씠泥?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	e440c3bc0409ab1b0745da35056e8e4edcaad593e95f0a8ccfd3cad87ee5fdb9	?섎굹 ?곴툑 10留뚯썝 ?댁껜 ?대젰	KRW	怨꾩쥖?댁껜 ?대젰	04:20	t
7e7aa8f0-0075-49e0-9e85-d2b143e2cf46	2026-04-21	120000	?쒖썝?명꽣?룻룿?ㅻ퉬	二쇨굅/?듭떊	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	699fe4f82e341d5855f42e1c6c077e8b65b37349f4f3b0879c3abf7b3f4c58a0	\N	KRW	?명꽣?룹눥??08:21	t
a7ada7ab-38f9-465c-9d72-9a8702d4573b	2026-04-21	220270	9301239560141	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	958d73d5235ded1add156721c6e65e730aefa6c84773f23cc684e533f90a6e1c	?섏쭊 ?異쒖씠??KRW	?異쒖씠??05:05	t
6fdcd000-ed92-46e5-89a3-956ede9da93e	2026-04-22	100000	15191035272707	?異?expense	湲됱뿬 ?섎굹 ?붾났由??곴툑 (?댁껜)	bc331b094bf0ecc1b1baaf711030829a04920035a33f433221dbb8b5d16cab39	?섎굹 ?곴툑 10留뚯썝	KRW	?異?04:20	t
9235ee93-1f93-4977-81da-2d639b5688bf	2026-04-19	2294	寃곗궛?댁옄	湲덉쑖?섏엯	income	OK吏좏뀒?ы넻??(?댁껜)	c3db7e2415dcaee0117c9d8946f3186aec87fba131bbfe38ab6873b2e271549e	\N	KRW	?댁옄	15:26	t
40a48d0f-8b3a-4456-9715-e322b7ed981e	2026-04-19	12800	(二?而ㅽ뵾鍮덉퐫由ъ븘紐쎌큿?좎꽦??젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	6f808d3772cbd9b78fea4dfc0564699e388423a34239f899a3d8fad187056cd0	\N	KRW	而ㅽ뵾/?뚮즺	14:28	t
3f398a71-d40a-436d-a12c-78e3a0d334cf	2026-04-19	1650	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	37813188e07c3ab3f31715d396ab70b77e883a44a71198c674de25434e58314d	\N	KRW	?以묎탳??10:08	t
7e587fb1-3487-4763-b851-1a4095bf880b	2026-04-18	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	afd7061131b87f0862ba68dc80b6b66906e845828c182b6a48b5848da4084085	\N	KRW	?以묎탳??17:15	t
6b274e67-241a-46d7-9e97-62e996cdf19b	2026-04-18	20700	?숈꽌?앺뭹(二?留μ떖?뚮옖??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	077601389374cc8f37611241a54b28accd28226da813d6837d62313bf061cbb5	\N	KRW	而ㅽ뵾/?뚮즺	13:57	t
4b0bee2c-4b72-4fe7-87e4-bdde655e9fdc	2026-04-18	350	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	d0091181c84fe94c97712f9bac351b96f0d8d69eac43177f2695d9eedd866c75	\N	KRW	?以묎탳??07:44	t
87e1cb42-31c7-4110-8335-1c04ef291640	2026-04-18	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	307c7332159a41bad2bcf57a5a1e19d007add03d6f661bf643d2c1d49e33234e	\N	KRW	?以묎탳??07:29	t
82767a7a-583a-4cfe-abaa-5c25381e0e62	2026-02-25	47790	?숈뼇?앸챸?異뺣낫???異?expense	?쇱쬆?댁껜	ddce4c8c697c3d5e449bebdfa6abd174e7e3ab80ebe214f7824245e58b426c8f	?⑥?異뺣낫??KRW	?異뺣낫??10:00	t
4b172587-26e4-4533-b1fc-c2c8298bce87	2026-04-17	5800	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	cf87be57d1fde5c2d1fe1cf7d40dfa65b3eadc815da3d8bbac0b8cc888375f77	\N	KRW	而ㅽ뵾/?뚮즺	14:30	t
d972d16f-312c-4ee6-801f-ebaa0875912c	2026-04-17	3900	諛붾굹?꾨젅???댄솕?щ???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	1a436ae5e4721e0375aa641a6b3e46223f69cb9122c65cb810db2fb9701abcd3	\N	KRW	而ㅽ뵾/?뚮즺	08:30	t
741e0ae1-8ea5-44ec-b9e0-011fe6cd74c5	2026-04-17	4000	?뚮━諛붽쾶??移댄럹?대???젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	cc494ce459626cbde0d25e9865c7ecc4ae16bdd516f4a30356fea80ae0637a3c	\N	KRW	而ㅽ뵾/?뚮즺	08:27	t
edbb3ecd-1f62-4b0e-a198-c38a8affa807	2026-04-16	47700	?대컲(URBAN)	?⑥뀡/?쇳븨	expense	MULTI Any 移대뱶	ce4635e0bab6e01d309ed90b514aa09917cfa5d880b6dafb1cd0a191ff5fbd2d	\N	KRW	?⑥뀡	17:34	t
fd97e716-f442-4c23-b3fc-f4630afcd877	2026-04-16	5700	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	9373f6b5cace0ed4507e94485602cc0a5c607cedb0b30c616781881e068eb31c	\N	KRW	踰좎씠而ㅻ━	09:26	t
bb4c9e9e-0049-42a2-a866-1d9fc5c87513	2026-04-15	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	108ac0a324238464470d07e2c02e6dd3a2f0e620e38417010443d8edbc0c40fe	\N	KRW	?以묎탳??17:25	t
1d1c1b84-9c1b-4a68-834f-a7dec4e89a0a	2026-04-15	9000	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	33524089bd48da9dba5c851474f517d1f107f8d8416f9ef5b2b9de59bfe8bd31	\N	KRW	而ㅽ뵾/?뚮즺	15:46	t
747ef76d-2ef7-43fa-b979-c7f0961e6b22	2026-04-15	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	0c46bc2a5276c38e0a1f2c9202106eb325ca45443a7993cff064845014908830	\N	KRW	?以묎탳??07:55	t
2e896a13-0666-4ca8-b67c-2266722a0634	2026-04-14	59940	?명띁?ㅺ났?앸ぐ	?먮?/?≪븘	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	a9d28bd209d68e47cf74533a4f590b7a31692432eae79ed43dad40a2f2ffc96e	遊됰큺 湲곗?洹	KRW	?≪븘?⑺뭹	21:20	t
e4cb82c9-a38f-4a34-a6e1-d22f9ef49f93	2026-04-19	9800	?댁냼?쒓낏?쒕?援쎌??ㅻ━??젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	3e07ef099e762724a0458c660b7bc64e52f403d84a3859d2a445cb81a4576c95	\N	KRW	?쒖떇	12:22	t
4771097b-c4db-498f-97fc-a7d1137ab80d	2026-04-18	5100	?뚮━諛붽쾶??媛뺣룞援ъ껌??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	95ed39a228219eedc804f46141d66df126d500d113cefe22910da05f6104f871	\N	KRW	踰좎씠而ㅻ━	18:46	t
cd6d1045-98a6-423d-9e2c-dab04e71dcb5	2026-04-17	3600	?ㅻ튃怨?4 ?꾩씠???띾궔??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	9e6c4d6e55917d625b4df024b55d7b576971a6b0ffb91ae1dc63f0d15fd6fd8a	\N	KRW	?꾩씠?ㅽ겕由?鍮숈닔	20:58	t
ed1cabac-052b-46fd-99ec-6376ed6d9c0a	2026-04-18	568010	?쇱꽦?붿옱?댁긽蹂댄뿕(二?	?먮룞李?expense	MG+ S ?섎굹移대뱶	7bdd661064dc010ed84f97afa9e1fe04482aa9cd9f4ba4e7d52e679594437eb2	?먮룞李?蹂댄뿕 1??媛깆떊	KRW	蹂댄뿕	14:38	t
aeabb1b2-5578-446c-8b32-f5a3e6ef88c8	2026-04-16	2400	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	7c1af8521dda93677415bdae60218cd2dc4192749059ad17708434391b18aafe	\N	KRW	?몄쓽??22:15	t
b863b2b1-6ee3-4d60-a5d8-f2e467b2f58b	2026-04-15	34500	RAYPIDE	?⑥뀡/?쇳븨	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	887fc5b3d9fe4be5f4c250a14cf9c9d1b47eab93de77c80e8ecbd7516155be06	??釉뚯씠???곗뀛痢?KRW	?⑥뀡	08:32	t
8a7c7b96-a09e-490f-9af3-ec18a23412a4	2026-04-16	24000	媛먮?移섑궓	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	1c22fbcea3de3cbf146a613a13e58da15a126560600655e9d38143f1167201af	\N	KRW	移섑궓	22:05	t
25fe321c-1f59-4e7a-83a8-5cf5a6677c2c	2026-04-19	30000	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	酉고떚/誘몄슜	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	dd6abb9a9a5bfefcd2394a1924880387defa6d4366b4074b52dc4db09ca205fb	\N	KRW	?ㅼ뼱??11:00	t
215c824e-5620-485a-b930-ee745aa23ce3	2026-04-17	4500	?뚮━諛붽쾶???띾궔??移댄럹/媛꾩떇	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤?? (移대뱶)	e815e6f192b05734fc758a709f713634b1825e8c5b1746aeea66fb05a27bde30	\N	KRW	踰좎씠而ㅻ━	20:36	t
2a88b8ae-d645-4bba-867f-2af7e441ee7d	2026-04-14	2400	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	18a3166e757f5afa1345f73650e375b842109e8680d23838c19140cce05fe25c	\N	KRW	?몄쓽??18:26	t
efeae572-f320-4018-86a4-877ef2e6bf52	2026-04-17	29500	源?몄썝	?댁껜	exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	a3f05feb642e576381c2c893e753b9954f98802d1465b3723599bde64e1d8897	???⑸룉 吏異?KRW	誘몃텇瑜?13:36	t
aa386950-d7cd-4017-a6ec-1b09f835b18e	2026-04-14	3320	?명띁?ㅺ났?앸ぐ	?먮?/?≪븘	exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤?? (移대뱶)	5861369e1ef2e6efef64d9c1a091f6379a04fb73ad9c65fee8c919c0664bc999	移대뱶??寃곗젣?좎씤??KRW	?≪븘?⑺뭹	21:20	t
84413f80-9f1a-433e-bf23-71bb4cf8d964	2026-04-19	13500	?ㅼ삤?ㅽ겕(1)_肄뷀럹???앸퉬	expense	MULTI Any 移대뱶	5ca93fffc62773faed0f19d8bc065fc1e14031bdc9b395dc71a4713377caa954	\N	KRW	?앸퉬	10:59	t
c492421b-bcf4-4337-813f-63526478c6c3	2026-04-19	2200	?⑥쑀(CU) ?깅궡?쏅퀎???앸퉬	expense	MULTI Any 移대뱶	7c7d9a6aa517f3e452aa283e119bda70103db76f3cafa4a38b8aea3482ab250b	\N	KRW	?몄쓽??11:21	t
e6e618cf-5733-4c4f-9081-7ef0fb5f6dce	2026-04-17	54000	移댁뭅?ㅽ럹??移댁뭅?ㅽ럹???쇳븨	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	2bcc9150b722836519389f6a2f329d78887b3a11f989213c2d09cf37b4d23d21	?쇰룞 鍮꾪?誘?援щℓ	KRW	移대뱶	08:37	t
cdca4bfe-837c-4cf8-b73a-9e7237473e75	2026-04-14	3900	諛붾굹?꾨젅???댄솕?щ???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	9a0070c80db940a3d95df29611bc1342dd3fd8c66170b6144c9889089a894ac6	\N	KRW	而ㅽ뵾/?뚮즺	08:52	t
6ec9358d-6cbd-493d-8ad8-9d0a4840d611	2026-04-14	4000	?뚮━諛붽쾶??移댄럹?대???젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	24b924980c6cae2e59f2139a232830afce7a9a35ca455f7122f1f06adbc03ac1	\N	KRW	而ㅽ뵾/?뚮즺	08:47	t
33d4cf8c-f849-4e34-9180-51114a5b1075	2026-02-25	109280	?숈뼇?앸챸?異뺣낫???異?expense	?쇱쬆?댁껜	113ff4aac2a9d47b8000fcd6e61a6856d659f70cf8729ec7b442fb5b7240f42f	?⑥?異뺣낫??KRW	?異뺣낫??10:00	t
37a9b8a2-53fc-4cde-974e-a2b6b9ec167c	2026-04-13	600	?ㅽ?踰낆뒪肄붾━??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	f93c219f66971e68a1e3cd7f9423fb672658de5ed4593e21971e1059651f8b4d	\N	KRW	而ㅽ뵾/?뚮즺	14:01	t
7061e6c3-7d06-4332-af88-bd26abf869f6	2026-04-13	6500	援ъ떆?꾪뫖?쒕쭏耳??앸퉬	expense	MULTI Any 移대뱶	34bc42f0f5a3aad2c9c1cef9b032f66caec8d9e554bbf9c06d057905caf6c3bf	\N	KRW	?꾩떆?꾩쓬??13:34	t
2500fb26-5e33-41a5-9d78-2c103558cf10	2026-04-13	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	ff1140392043642c575f91424fdfede614cde9c15195a538bba12b2a7548fb3c	\N	KRW	而ㅽ뵾/?뚮즺	08:58	t
bb0bd8e4-bfd7-4056-b9f2-106e8e998eb0	2026-04-12	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	12fcf4e065b75d29e97e81f269768dbf4378058f53bcab48edbe2bf9e9ad73d1	\N	KRW	?以묎탳??22:10	t
bedf90de-d36d-4839-9ab0-2fb061e430a9	2026-04-12	126200	POPOLO(?ы뤃濡?	?앸퉬	expense	MULTI Any 移대뱶	a98a5862c26f0447cb0c1dc9bbd496535c0436338cdf75192e9a75921d78098e	\N	KRW	?쇱옄	14:23	t
15af234c-e92c-46e7-bf1a-b875f02a250b	2026-04-11	26900	(二?而ㅽ뵾鍮덉퐫由ъ븘?쇱꽦濡쒖젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	4162786cb270af1ca6f030e794409c9cb9bc8873d70cf78cdb632ead7362445d	\N	KRW	而ㅽ뵾/?뚮즺	19:38	t
c5cbaa72-b3b1-407f-bfa0-751bfabd7019	2026-04-13	1949000	?쇱꽦移대뱶	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	39a8414f290ffbf5bfb114c99a9cbd6fa26587ca9969226b4722cd833954becf	\N	KRW	移대뱶?湲?19:02	t
e70807cc-c697-460e-9d5e-522a8df662b0	2026-04-13	1184770	?섎굹移대뱶媛??댁껜	exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	507263100248a55abadccdb9ad7568b64dba989563ea891d90ed8a2379fd69c1	\N	KRW	移대뱶?湲??댁껜	08:16	t
d8e63b95-13e2-4440-bb20-d1f3dc9e3126	2026-04-13	1013799	MGS移대뱶媛??댁껜	exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	9b7eb1265fa7010863f884a9147d948f338f6cdcf7a246068141ccba3d21e6a8	\N	KRW	移대뱶?湲??댁껜	08:16	t
ca95012d-816b-4d01-8fdc-ec4d3c8a9b57	2026-04-13	1013799	MGS移대뱶媛??댁껜	exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	8ca1fac4d9f2fb2d060c65fb258cfa6a77d73a8ddf4f8667218198aa5e5fc88e	\N	KRW	移대뱶?湲??댁껜	08:16	t
30c4585f-a2c4-4db3-9d2a-5bec447317ce	2026-04-14	100000	紐⑤컮?쇳떚癒몃땲_?몄쬆	援먰넻	exclude	LOCA 365 移대뱶	b236a78e865c8ac51b6d5abb36f2f2c1d07148690d957845a0ee384d694a4998	?좎떖蹂寃쎌뿉 ?곕Ⅸ 援먰넻移대뱶 ?ъ씤利?KRW	?以묎탳??10:37	t
3eb216a1-14d3-4e96-88b8-ecfe77f0dbb1	2026-04-11	20300	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	b512eb75567c2d2581f519b0d4b16809a975a239a7bc9f85f40c5b38b97a1a61	\N	KRW	諛곕떖	20:11	t
1162b18a-58fe-4a99-94c6-775f6fe27d9d	2026-04-27	50000	?덈쭏??4-027	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	186fe1131b99dcd03a6835970e5786461f12857d39a1d7a338da851462a601c8	\N	KRW	?곌툑?異?05:57	t
bc598cee-5dcb-4e64-8688-7d69d922b8a7	2026-04-12	26000	?붽굅?ㅻ젅?댁뒪	?먮?/?≪븘	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	3f75261188b9afb069263b962a79ef2c60e44ae1eefa71b69e23e4cd11ded184	?쇱궛?몄닔怨듭썝 遊됰큺 ?먮룞李????KRW	???泥댄뿕	13:21	t
df12f973-73fb-49eb-bb66-60c0b2912ff8	2026-04-12	2500	KCP-寃곗젣	?⑤씪?몄눥??expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	12684cadc3ef4d74529648632fefc83e7769c0ad9e1ed58ae4871d6774aab1d4	\N	KRW	寃곗젣/異⑹쟾	17:18	t
999238dd-93fd-4b02-8cab-e834b6672e17	2026-04-13	87820	?꾨??댁긽?붿옱蹂댄뿕(二?蹂몄젏	?먮?/?≪븘	expense	LOCA 365 移대뱶	7039047d41255e0882b7eb3bd5f97e555e4c076bfea7320c8291744a18527a9b	?대┛?대낫??KRW	蹂댄뿕	17:43	t
0c9f1055-4a5b-4115-a95a-f8f0b6105cc7	2026-04-12	5800	?ㅽ?踰낆뒪肄붾━??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	9354f24fcdd19f50695be7ad10b9c92ca45cf464b25205f6ad80f21909ec2da7	\N	KRW	而ㅽ뵾/?뚮즺	09:51	t
5905e99e-0288-45bc-8045-96683e7f20ee	2026-04-11	10000	?ㅼ빞遺??앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	9f4c990c2c59852faf8c8c8a2d25f268f58492fd022b923826ec3c07bb69ff8c	\N	KRW	?쇱떇	13:21	t
1b520085-b647-4e82-9341-aeda5922a64f	2026-04-12	2000	?곗씤?꾪겕由ъ?鍮?李④?由щ떒	?먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	09751afc808e8186e66ed2358546e2150da0c60609dc386b53d1fec7e664659a	\N	KRW	二쇱감鍮?20:13	t
047a3c62-6205-413b-abc9-98d6d4083502	2026-04-13	24730	?щ━釉뚯쁺	酉고떚/誘몄슜	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	a7b3a9bd1e334b29edd277a88f02bce717eccc85845045d8bcd4107d5b1f1622	\N	KRW	?붿옣??15:33	t
92788de3-d79c-4548-849d-34e1f1102710	2026-04-14	11000	?뺤????앸퉬	expense	MULTI Any 移대뱶	f9c1a96d898f4a597ca94b791ac4ee56860f0920b29d87d5d3764eacaa246f46	\N	KRW	?앺솢?쒕퉬??11:58	t
219a5069-a09c-4486-b96e-018d639fce15	2026-04-13	56690	KT?듭떊?붽툑 ?먮룞?⑸?	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	9e73ddf8e3a11820968009d39c6b11ed20832b9e348eb134f4c17255bfaf6143	援??곕퉬	KRW	?대???14:11	t
8a1ebcdb-1c2f-49b1-b94d-3a8fc1e18d3d	2026-04-13	340280	?꾨?移대뱶	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	6411fd8b97bc8ab874dfda679d22867692facbbb519af559d111ef9a44a39159	\N	KRW	移대뱶?湲?21:35	t
43afed25-68c4-4476-af90-be6cb85f4a87	2026-04-13	1184770	?섎굹移대뱶	移대뱶?湲?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	ea6e335a944ed3fcb19e1ad151774912f79bb53a95b897f6640cdb82893626a4	\N	KRW	誘몃텇瑜?08:19	t
90de0162-cbc0-49ba-8a04-74d7ff3977ce	2026-04-13	23100	KT?좎꽑?곹뭹 ?먮룞?⑸?	二쇨굅/?듭떊	expense	kt 怨좉컼??Simple Life 移대뱶	e787e894c4cd160ef53d4e111ea6877351fc8902164fce69abfcf39373c98154	?곗뒿???명꽣??KRW	?명꽣??19:17	t
bd5e4aa5-a042-44ed-97fb-962954903cee	2026-04-13	9200	STORYLiNK	?⑤씪?몄눥??expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	a649bacd7c3bdaa7d4d9977b5f026037f6cbe52fae90ed9d46dbd11c3c935c38	?꾩튂異붿쟻湲?耳?댁뒪	KRW	?명꽣?룹눥??16:56	t
e4ac3c4a-25b2-4936-824e-1f62cc5a776e	2026-04-11	500000	?섏쭊2痢??붿꽭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	375c12d9eaf2333a187d40d4956efc9fc1b96738e776fa9b55db400e7b90d959	\N	KRW	?붿꽭	23:44	t
f7e48420-1e1f-49d7-aa9d-bcffe51b337a	2026-04-13	10000	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	酉고떚/誘몄슜	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	3fbc0fb15fc2f61e6b21bf2f96f789b2968021afad5394b647fa5c7192bc1ef2	?덉빟湲?KRW	?ㅼ뼱??15:55	t
8d6697a6-7740-4108-a722-22efa5afbed3	2026-02-25	48362	援먮낫?섎즺?ㅻ퉬	?섎즺/嫄닿컯	expense	48362	29fa5a9290a9d8d208e8d92edf4a8cfae071a4d449d99b406c8201b9e997dd55	?⑥쓽猷뚯떎鍮?KRW	?섎즺?ㅻ퉬	10:00	t
7c1c2629-72d6-453c-bcdc-ac276fb73ade	2026-04-10	3600	?섑궓?꾨꼫痢좎뿰??숇Ц?뚭???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	9a33ef6da95ddbcfe9f9527c87e846a9fca8fa46fd930d9c83689e95f107ee55	\N	KRW	?꾨꽋/?ル룄洹?14:53	t
ccb606a6-8471-411f-88f5-9e9b93316a7d	2026-04-10	1550	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	1e3bb6b47712979eeacfa9ee33a9af5a9e60549a63fd01c9dc5a199f30ea3c27	\N	KRW	?以묎탳??12:45	t
7658a87f-5b6d-419e-8296-e6a7b20a7d17	2026-04-10	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	1a0b580c153979827c605d2d89c4c0c314f2035ea9395e9f91ff80814ea62a55	\N	KRW	?以묎탳??10:43	t
00261699-cd9c-480b-9b4a-d2140521c110	2026-04-10	1500000	怨듭슜鍮?吏??怨듭슜鍮꾩???exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	f0f55bae4d27e115a1f1d79abff4836ce338f924e22862ab015a7511c9ef3408	?뚯궗 移대뱶鍮?吏??KRW	移대뱶鍮?吏??09:50	t
364af4fb-8562-4d5b-9fca-5a295aaf888b	2026-04-09	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	46302ffd16658ab96f3208b43d33a0c1c958ec7dc946e53538a8b9c75a9c66aa	\N	KRW	?以묎탳??19:39	t
84e6d1e6-3ab7-435f-94e6-60d619987756	2026-04-08	10300	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	5244e551f937d257b0398d5b4a8d4d1a0b15310c707be3400a7359b63dde0000	\N	KRW	而ㅽ뵾/?뚮즺	14:25	t
c69f99eb-bb55-4442-abdd-f6517c13d2f3	2026-04-09	500000	?섏쭊 1痢??붿꽭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	46ca892351c6cd3969797ab02d2c7088779c4fb37106082f72755c73f199c541	\N	KRW	?붿꽭	13:14	t
7da80e83-533a-4818-8a6c-b5ae349afd08	2026-04-10	133082	?뚯궗 移대뱶鍮?怨꾩쥖?댁껜 ?대룞	?닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	dab0476d7721451975991685088b2d98c9698fad22510e50d5b7b589cc570376	?뚯궗 移대뱶鍮?怨꾩쥖?댁껜 ?대룞	KRW	怨꾩쥖?댁껜 ?대룞	08:50	t
cf3959fa-e1f2-4b3c-be1e-d31b54f456ed	2026-04-09	12000	?肄??몃뱶?몃윮	?앸퉬	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	9f696080845f54cc49b3c46fbcb5321f288bfb7bf7be7869c10e7953ec516b78	\N	KRW	?앸퉬	19:19	t
688ef3e2-dc2a-42bb-b35f-74f1c3d20fd1	2026-04-10	5800	?뚯궗 ?섎즺鍮?吏???뚯궗?섎즺鍮꾩???income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	7ebe4b18e4f8c06208efe5aea82d9e82b010090a766a6ea8b1094f1e9281fdbb	\N	KRW	?섎즺鍮?02:01	t
c1a261e0-a3e3-41f9-b405-ac199488f44b	2026-04-08	19000	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	4c91e34bf3465f6dcd599ee8311eeb7c6c4387876db7da2ef141d9d69f0f3e19	\N	KRW	諛곕떖	19:02	t
2c75483c-4593-442a-80f2-dcb488669a01	2026-04-11	9000	濡?뜲臾쇱궛(二?濡?뜲?붾뱶紐곗젏	?⑤씪?몄눥??expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	522dfaffcd2ac71de6de9afd878e65c5bb253155ae6c30ed098fa0bc958bacdb	\N	KRW	?명꽣?룹눥??13:02	t
40451a5a-ec29-4497-9451-be1c18c37678	2026-04-11	4500	濡?뜲臾쇱궛(二?濡?뜲?붾뱶紐곗젏	?⑤씪?몄눥??expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	d4e6314d02fdd3da3c43674a5df9db87a1bfd4a1de38d20602b2a5446fc0b763	\N	KRW	?명꽣?룹눥??12:39	t
5f6cb54b-8cfb-4ee0-b107-e98df7d97b5b	2026-04-10	99400	踰ㅻ뵓??怨듭떇紐?泥?냼湲?	?먮룞李?expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	2a2a4beb738153fd6977b0fde287e8e77ef95ff10bfb88e494ef71d2777ee4e5	?먮룞李?泥?냼湲?KRW	?쇳븨	10:05	t
b3b4463b-df2e-422f-9d95-54fe2cd31ee1	2026-04-08	800	KCP-寃곗젣	?⑤씪?몄눥??expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	a77b5ee1738adcc1b3b6bde6e84c6e85c6ccb62ac393a42b56924416f7e82f7d	\N	KRW	寃곗젣/異⑹쟾	13:10	t
21e08e13-7786-4caf-969e-461024183587	2026-04-08	4500	而댄룷利덉빱???깅궓踰뺤썝??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	cfa75c5550a27ffc01d461d3229e2ad854a8deeabb892c3e4c7ccd1406161a63	\N	KRW	而ㅽ뵾/?뚮즺	12:35	t
b775037d-e3d2-4580-b2e8-1a4429003881	2026-04-08	8900	?뚮━諛붽쾶??遺곸쐞濡?몃옩??젏	移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	8d2ae7737068c4c3e7cc43cdc5ca7e7e0248c6d8f31fc7cdba081939dbd28323	\N	KRW	踰좎씠而ㅻ━	11:50	t
3a6b3f78-180d-4325-be3a-c86b1b01265c	2026-04-08	3600	留ㅼ씪?щ뒗?щ튆?⑤늻由ъ빟援??섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	dfefa46b6264bd2fda3ca5eb10abf4d0baafb1fa34ae55f5981cd18146c99a35	\N	KRW	?쎄뎅	11:33	t
aee54b9a-e813-4dd9-9a25-bb63f4f74b68	2026-04-10	600	媛?⑤낯???앺솢	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤?? (移대뱶)	7dedf88598db23ba9ee73d667ee5441ef8a3be03855586685bca10be30f482cd	\N	KRW	媛援?媛??10:08	t
7d750668-7bda-4cb9-aa17-fd41d79e7b82	2026-04-09	2400	吏?먯뒪(GS)25 ?띾궔?꾨????앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	fb1a344ac311fd92da515fa965965788b68ca885b5455ac2ea39108a48bcaf0e	\N	KRW	?몄쓽??19:21	t
3ef8308f-0b30-4fb6-b2dc-f9307a5f75bb	2026-04-09	700	?踰뺤썝 ?명꽣?룸벑湲곗냼	二쇨굅/?듭떊	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	dd6ce0a8c64d265d642f5f5cf8c45ca5a742d86df564abab75c137d8f071218d	\N	KRW	?쒕퉬?ㅺ뎄??08:45	t
69a4be15-4244-41bc-bf94-62bc23ea821c	2026-04-08	9000	?쇱쭊	?앸퉬	expense	MULTI Any 移대뱶	d4958085ec7e2079b84f97b603b090c920d1ce58a55432cc9c4ea10e62257a15	\N	KRW	?앸퉬	14:20	t
8b14a30f-5c73-4a6b-befc-7701d95364d9	2026-04-10	10300	媛?⑤낯??紐⑹퓼??	?먮룞李?expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	e1f435792c05db3b23e2d5645c9fa4e28ca0ac9b0771ba0922016eefbae26f35	?댁쟾??紐⑹퓼??KRW	媛援?媛??10:08	t
7862bfd0-dd9d-4626-8463-e60301a6541d	2026-04-10	133082	?뚯궗 移대뱶鍮??낃툑	?뚯궗移대뱶?뺤궛	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	92d5b7e9721709101e3173e22813dc5fddb072ce43ebce16c296ee886e36769a	3???뚯궗 移대뱶鍮??낃툑	KRW	?뚯궗 移대뱶鍮?08:50	t
d7676177-b9c4-478c-9ab1-0b5adb5554ce	2026-04-10	12800	荑좏뙜?댁툩	?앸퉬	expense	SK?명뀛由?뒪 X LOCA (移대뱶)	98083e40a4fcc7d32a84ee8ef32edb21fed3fc7ec4a534c8c8adf3a54dc39337	\N	KRW	諛곕떖	19:07	t
72546629-2a7b-45b5-89ef-99e4251ba77d	2026-04-10	15800	荑좏뙜(二?	?⑤씪?몄눥??expense	SK?명뀛由?뒪 X LOCA (移대뱶)	c281e987f9faa241010673fdf6d69784daa28c313caa19599ce72a05318ac328	\N	KRW	?명꽣?룹눥??09:53	t
1067c79e-b6d3-483e-8a08-7efef89aaedd	2026-04-10	19700	荑좏뙜	?⑤씪?몄눥??expense	SK?명뀛由?뒪 X LOCA (移대뱶)	4a62609246c36e3501ba175d8adc1b98df451a41b02e507e3f8ef4aa6bc622fe	\N	KRW	?명꽣?룹눥??09:50	t
b078d1d1-c67a-4955-af0c-4de13976381f	2026-04-08	2200	?⑥쑀(CU)?≫뙆?좎꽦???앸퉬	expense	MULTI Any 移대뱶	804ffe9dfc6701737ee8349b93fed5cad625faf6f61c0dcd163489afab5836d9	\N	KRW	?몄쓽??20:33	t
c6dd9dfa-8d66-437e-9f85-b0e90c2fee10	2026-04-09	700	?踰뺤썝 ?명꽣?룸벑湲곗냼	二쇨굅/?듭떊	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	32bda536f2c45d22ea663abbeb6f4fdbec8725a31b21d8375e17906b6b3b300f	\N	KRW	?쒕퉬?ㅺ뎄??08:40	t
4fff72d7-a65a-4947-b727-4de30b4baf96	2026-03-03	608926	異쒓툑 ?댁뿭	?異?expense	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	1002905d7a9a76a05823c548f80a6b546bf78189ccdaeb3b68dafe2b58009fa7	?꾩꽭?異??댁옄(2??	KRW	?異쒖씠??04:37	t
d19acd31-0487-4653-bee2-9588ca72b3c3	2026-04-21	30000	?몄쿇媛議깅え?꾨퉬	?앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	70ee12f0583e0be0eaedd2a21ad36dafed9458381ef252dd37c6d25e1a65de61	\N	KRW	紐⑥엫鍮?08:21	t
6d948a19-d67a-4ff9-9183-af843d7ec01c	2026-04-24	1899400	?꾩옄移대뱶鍮??뚯궗移대뱶?뺤궛	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	e82db818d06362a7b45be0f7652e8fe7749f23c96d6b9919d71d9c2f89b109b0	3???뚯궗 移대뱶鍮??낃툑	KRW	誘몃텇瑜?02:19	t
7d2febac-20fa-4933-b87d-11b7f4831145	2026-04-28	3900	諛붾굹?꾨젅???댄솕?щ???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	8f9b335dbc7c79ec95ec93d4976412433300ab97ed553acefa284d9a5590bbc9	\N	KRW	而ㅽ뵾/?뚮즺	11:41	t
fd961d5f-539d-4365-aa7f-88d5e80b0e8e	2026-04-28	10500	紐⑤?吏?앸떦	?앸퉬	expense	MULTI Any 移대뱶	07b515ba99465dc519784f38311b0b1140c684a7f5d9d7facfc081e2df488cd9	\N	KRW	?쇱떇	11:10	t
23924772-1cc2-45af-bc1f-ba63de67a9ca	2026-04-27	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	e1e2ea2be333d553fc4039f6ad561c9f75a482acc9f0650cde21f7d37aaba2b7	\N	KRW	而ㅽ뵾/?뚮즺	13:41	t
abf48927-ff5c-44c3-be51-958bd77969c4	2026-04-27	6930	?댁쫰?몄뒪 ?곕??숇Ц?뚭????앸퉬	expense	MULTI Any 移대뱶	c6dbda130ae63c1dc531440bd9adc7f8b507f89432ca69f0a02c8823da99dbae	\N	KRW	?⑥뒪?명뫖??13:12	t
d1f5c6be-b4d2-4413-92ba-da760f85a24a	2026-04-28	1500	?⑥쑀(CU) ?댄솕SK?붾젅肄ㅺ????앸퉬	expense	MULTI Any 移대뱶	a75d7272c6faff8802ae3d2616cc982dcf705d03718a052182793ce3f416b461	\N	KRW	?몄쓽??16:58	t
cad9f9b9-549c-4781-8d81-86dc89d9fcb2	2026-04-28	15300	?щ━釉뚯쁺	酉고떚/誘몄슜	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	4ed51fc7b08169c1dd0ec11788d0e0fb8d8972485824ac16cf22682182bc123c	\N	KRW	?붿옣??08:05	t
a0deff33-74c0-4adb-9c6f-07ead29138ea	2026-04-29	10000	移댁뭅?ㅽ럹???닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	77fa4787edbfbb275e81467252691dee5ca49f40d8cec7671685c74aa9c29482	移댁뭅?ㅽ럹??寃곗젣 ?먮룞?댁껜	KRW	誘몃텇瑜?18:19	t
8454d497-15df-4415-85da-157afaef1567	2026-04-29	629223	28498013336942-00001	?異?expense	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	a032177c5398590e81961aea9a84db561798edf472ab57e1af08cc602a4780f1	?꾩꽭?異쒖씠??KRW	?異쒖씠??04:12	t
266783ab-8b42-4a86-ba65-476a812e57e6	2026-04-27	46710	SK ?명뀛由?뒪_?뺢린怨쇨툑	?앺솢	expense	SK?명뀛由?뒪 X LOCA (移대뱶)	e8520ffca20c414da703baa7407141100ffadb687eff55897ff8842a8b11fd1b	?뺤닔湲??뚰깉鍮?KRW	媛援?媛??10:13	t
166e6634-7d12-41f0-a0ee-dc567c38576b	2026-04-28	103494	二쇱떇?뚯궗 移댁뭅???⑤씪?몄눥??expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	9b481ab4343e516d617e48bb0f086879f13d951e3a8c37ab4dce530e0ce3451a	臾대뒳 ?좊Ъ(?꾨쿋??	KRW	?명꽣?룹눥??13:43	t
d83ba957-6462-4bd8-8394-739185f656a6	2026-04-27	48362	援먮낫 ?섎즺?ㅻ퉬 蹂댄뿕(??	?섎즺/嫄닿컯	expense	?쇱꽦利앷텒 ?댁껜(?섍린?낅젰)	afc9a242ff8cd53fce3421f477cf446486d6e2e037c24efa6452e6ee69fe8f91	???섎즺 ?ㅻ퉬 蹂댄뿕猷?KRW	?섎즺?ㅻ퉬蹂댄뿕	09:00	t
240fefaa-ed5d-4f3e-863c-a04c4370e533	2026-03-23	250000	異쒓툑 ?댁뿭	?⑸룉	exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	559b8317d4f5a76dddf3732ba94d32b5967243a7c035bf29692c2bdfab4a8565	???⑸룉 ?댁껜 ?댁뿭	KRW	誘몃텇瑜?09:07	t
c8cd295d-c4cc-40dd-ae39-c8bad5cf10de	2026-04-28	33400	?좎쑀?곗씠	?먮?/?≪븘	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤?? (移대뱶)	f64926906ad69c4d0ade185c8a00fe099a256de20f94d1d2cef29a7cc16fbceb	遊됰큺 ?щⅷ ?띿꽑 ?명듃	KRW	?좊Ъ	13:31	t
98d80da1-0aad-4377-876e-ab4366c64555	2026-04-28	41689	濡?뜲?쇳븨(二?e而ㅻ㉧?ㅼ궗?낅낯遺	?먮?/?≪븘	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	a23ddf64e8f1888b419d20d5b90bd2810175935edd5545e0b368ce98756a72c2	遊됰큺 戮濡쒕줈?명삎	KRW	?명꽣?룹눥??13:20	t
ebbe2431-27fa-46a7-aff4-7b10fa94d660	2026-04-27	2000	INICISPOINT	?먮?/?≪븘	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤?? (移대뱶)	6446e6ac3ae20fa2acec2991b6775d1c169704bbc65c1accffda935685a43b69	媛뺣룞?대┛???異뺤젣	KRW	寃곗젣/異⑹쟾	14:01	t
04f2113a-0cc8-4e9a-8eba-df7b16a18d7a	2026-04-25	0	?뺢린?댁옄 ?낃툑	湲고??섏엯	income	?몄씠?꾨컯??(?댁껜)	f5f0d080b134f1d21e2db8a8bf798c99f89a56e80eaaa764ba40798cc3cf9f74	\N	KRW	誘몃텇瑜?02:42	t
3780b210-a2a0-46ba-aadb-babe42f6879f	2026-04-27	47790	?숈뼇?앸챸 ?異뺣낫???異?expense	?쇱꽦利앷텒 ?댁껜(?섍린?낅젰)	c4e38cf778ef50433679694448276fb4f03786ae5750ae6ecb785d9a7271342d	\N	KRW	?異뺣낫??09:00	t
4c7bffa6-34d6-4e77-af17-0137f12ac616	2026-04-27	109280	?숈뼇?앸챸 ?異뺣낫???異?expense	?쇱꽦利앷텒 ?댁껜(?섍린?낅젰)	983ef99659272a2f6d95852ae97bb62ea40b8238d3cdc5dba61aadf04d8e00af	\N	KRW	?곌툑?異?09:00	t
b5010c1e-fe24-49ab-8565-8df91912acb8	2026-04-27	111750	?숈뼇?앸챸 ?異뺣낫???異?expense	?쇱꽦利앷텒 ?댁껜(?섍린?낅젰)	431144ea1d0cb6c432ad11cc5ede2851040b0c54e7127a6b964cc3864e77b6fc	\N	KRW	?異뺣낫??09:00	t
c777cd1a-9685-430a-bc02-2bed9907327d	2026-03-27	2	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	223d662c365ac8bb6ef7b54b86f0dc8963ed14d0c1d5d2fcd1dad2432ab1f6ce		KRW	誘몃텇瑜?16:08	t
1d7236e8-1bc2-45db-9702-2849407d4740	2026-03-27	13	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	cf72e65b41e1b3f1c4198e0b6279bf64f73838faf42acb52c6d4828299146a76	\N	KRW	誘몃텇瑜?15:35	t
6bd18eaa-e1e7-483e-ac4e-dc7acfad4268	2026-03-27	24500	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	a52d852e5c81bf2096e6c4b5e3c5448a76d268082c863a702eafae0bd5122d40	\N	KRW	諛곕떖	19:42	t
a1a149ad-ffe6-453d-ac8c-363a4816d58f	2026-02-23	250000	?낃툑 ?댁뿭	?⑸룉	expense	?좎뒪諭낇겕 ?듭옣	95cb8866ee8814ce21d646b9203cd8282c3f032d138347836e8f0275156e049c	?⑥슜??KRW	?⑥슜??09:08	t
39325c34-aff3-4978-93be-1a6efa0a59f2	2026-02-21	150000	援щ룄?쇱꽌?섎궓二쇱쑀???먮룞李?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	9077860aa11e54a0e499ae3bfeac6cdccb35c60fd770a90f4f7ec4d1378c689e	二쇱쑀 留뚮븙 ?좉껐??痍⑥냼 ?댁뿭	KRW	二쇱쑀	10:25	t
54f3beba-59d9-4053-9b02-ff8445ca1513	2026-01-26	111750	?숈뼇?앸챸 ?異뺣낫???異?expense	?쇱쬆?댁껜	7b5eb49bab59666b83227845d72958ebf89c53c8ec8c5ea3c799bd8408c198ac	?⑥?異뺣낫??KRW	?異뺣낫??10:00	t
09751c4d-7a55-4286-b6a0-f6f2404a3e82	2026-01-31	10000	??뱀껌怨??앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	990cb933907eeb34eeeddd0a917557066d0effa5864239b64253f41255cc520b	\N	KRW	?앹옱猷?17:34	t
7427e5ac-e908-40df-8e17-5eefcd00e9dd	2026-04-07	15500	?섎끂?댁쓽?꾩묠	?앸퉬	expense	MULTI Any 移대뱶	026fe6838cd4c94b27968df0942c642000112eb986221d4495875f86c7015bdc	\N	KRW	?꾩떆?꾩쓬??19:57	t
4282d324-cc8c-4ee2-9a50-0503c128c3dd	2026-04-07	6800	?쒖뒪?댄솕	?앸퉬	expense	MULTI Any 移대뱶	d0e382ca1e9727a9a3dbedf31c380370974d667e62d7327fa1dc3cdbe383d550	\N	KRW	?쒖떇	12:17	t
f27fdf60-9e30-455d-999e-89f01fef71ae	2026-04-07	3900	?뚮━諛붽쾶???곕??댄솕??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	448c54066876d4d9b283a6f25ca69085463dea04ce1b37582cc2df3ccd6d02d9	\N	KRW	踰좎씠而ㅻ━	09:20	t
096ef4f4-cfb1-470f-b299-26901e4c567d	2026-04-06	5800	留ㅼ씪?щ뒗?щ튆?⑤늻由ъ빟援??섎즺/嫄닿컯	expense	MULTI Any 移대뱶	b592568789aa309574b736fef5900e25bd139d9e58fed30946eef7f65189a3f7	\N	KRW	?쎄뎅	20:27	t
41a11150-2c0a-4bca-bc14-87bfb7641f69	2026-04-06	15200	?섏씠?붿냼?꾩껌?뚮뀈怨??섎즺/嫄닿컯	expense	MULTI Any 移대뱶	eb060c0785a46c8f13c3e2a380fa0808ab456426c0f1857c8e60451ad660c9c6	\N	KRW	?뚯븘怨?20:25	t
36885cf3-fd87-46fb-bc31-f9b7cbcf03bc	2026-04-06	5800	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	8bf9e897593d8bab12294e569395fdfa6832348c84103129480fb125b919f407	\N	KRW	而ㅽ뵾/?뚮즺	16:39	t
e0e23c8c-61d7-44ea-8a5f-1afe35c29d7b	2026-03-27	18000	踰뺤썝?됱젙泥?二쇨굅/?듭떊	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	73116d53793572e6928d658966d7594c92931525f12f487d155012e534e7f9a7	遺遺怨듬룞紐낆쓽 ?깃린 ?좎껌鍮?2李?KRW	?깃린猷?14:47	t
ee46191f-9857-4a61-8828-e4b00ef42b01	2026-04-04	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	16f8ea7947f1a519bd58585a42213d77c0bc29255d78d86a00d1b76b98d924d0	\N	KRW	?以묎탳??12:28	t
58336254-d78d-4386-a522-e5a0704638c8	2026-04-04	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	7955db3767c6a1607a7e6f48529d1f4e099835516ac600db331990f428344d94	\N	KRW	?以묎탳??09:12	t
5d591ddf-5c97-4491-908e-e662c81910f5	2026-04-03	29900	荑좏뙜?댁툩	?앸퉬	expense	LOCA 365 移대뱶	cef436ccaee2e72327a4914de89ed07bca09cd8331a4dfc8d8a2ba3c5009ffc7	\N	KRW	諛곕떖	19:46	t
b1adbbe6-0724-437f-a1d6-b22d40eb1307	2026-04-03	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	5c0f66e7b2d7dcfba3b9933993f7c6516369d60a763ec4865b34475ee1d05bc7	\N	KRW	?以묎탳??17:04	t
d30da8d0-9b5b-4a2c-9d44-6c4c6bb54ee5	2026-03-13	1240690	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	2d825f8dd6ad76e5284a90793d2318612516fde474674367aa932e66a8a086cf	MGS 移대뱶媛??댁뿭	KRW	移대뱶?湲?22:06	t
c7d5160b-55b5-409a-9c81-6c9c0d983942	2026-04-03	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	2d6ded815c01995a17ecbdd78c7855a7b0df56d14a833a7b14917feae1cbe887	\N	KRW	?以묎탳??09:25	t
531db434-ec3c-499c-878e-30eee30e7758	2026-04-02	13720	?먯씠?ъ뎾 ?좎떎	?앸퉬	expense	MULTI Any 移대뱶	088f4d0963765620f11eaa5d1799fb7b369000f04a6fe48b32f1d78ae68a0049	\N	KRW	?⑥뒪?명뫖??16:50	t
0a549528-a64a-4f2d-8196-b0b79b21d99e	2026-04-02	29950	濡?뜲罹먯뒳?뚮씪???⑥뀡/?쇳븨	expense	MULTI Any 移대뱶	a4fe7944d18bfb8bc30b5ab97f2110311a3e588a5e5af3dc2d5887b4e10a7163	\N	KRW	諛깊솕??16:43	t
732443c5-e9bf-4cc0-9c35-cb0adabf7900	2026-04-02	620000	?쒖슱?ㅼ쐞?몄튂怨??섎즺/嫄닿컯	expense	?좎꽭怨꾩씠留덊듃 ?쇱꽦移대뱶 SFC 7	59f7b3f15bec054e87d24b2f68b82c3ac94bb881e048b767a1e3dd07bdbfff14	\N	KRW	移섍낵	16:11	t
7ccb4f1b-0f19-4e23-a10a-a7b0d82c61f4	2026-04-02	16600	?섏씠?⑥뒪 異쒗눜洹??먮룞李?expense	?꾨텋 ?섏씠?⑥뒪 ?듯뻾猷??꾩슜 移대뱶II	dd393fb7300ab930fcd71030e99eb2e6defe2657595ddfaf454e05e044702805	\N	KRW	?듯뻾猷?00:00	t
ca4fb1ca-de1b-4944-807c-0dc4e954a91b	2026-04-02	10900	紐⑤컮??踰꾩뒪	援먰넻	expense	LOCA 365 移대뱶	0f9f867fb7a04a44104974bfbfd73ba5bfcec772e1c0bcf0e301dd02d57369c5	\N	KRW	?以묎탳??00:00	t
c1f553a3-edac-4ee6-8f46-912fea9f5602	2026-04-02	54100	紐⑤컮??吏?섏쿋	援먰넻	expense	LOCA 365 移대뱶	d4312a5b44d1f79f3103f2475e926c3feaf8a3c71b9454def051cf548cf7d639	\N	KRW	泥좊룄	00:00	t
2b61b912-b808-4990-aa41-a81aa84feeba	2026-04-02	17	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	de75b66b2f1dfedd508a7f76a97aa5b15e996b953cdd42ed25dc9724adbe2b33	???⑸룉 ?듭옣	KRW	誘몃텇瑜?11:23	t
3bb674da-d00e-4b43-be07-197cbc7f24ac	2026-04-07	150000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	970df77f7dad63dfb69abef0681d7208a558521b212c73e7ab0e7b075143d4ad	???⑸룉 ?듭옣	KRW	誘몃텇瑜?11:52	t
f3e1d306-8ab4-4449-9578-46934171630c	2026-04-02	2	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	b2ccdd294c5a455805b0e69ac1e3deb365b36ddc7c5d5750e234739d6576d5f8	???⑸룉 ?듭옣	KRW	誘몃텇瑜?11:28	t
2d645240-bab7-40c4-b7b5-4624264b3823	2026-04-08	2900	?섏씠?붿냼?꾩껌?뚮뀈怨??섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	daa751b9e6aeb1e1212948cb9cfb6f652591104514500d5dc75c599bd77f89b1	\N	KRW	?뚯븘怨?11:30	t
57d5a800-a0af-49fc-82e5-9dae3cdbbca4	2026-04-03	74600	(二??쒖씠?붾툝?좊뜑釉붿쑀(JWW)	?뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	47f95aec77b18ce18a179f545e59cf741f0801b23fe52793907eaeb46f56600c	?뚯궗移대뱶 寃곗젣	KRW	?앸퉬	11:40	t
a281e0bc-9c2e-49cc-a442-903c96ee3ca1	2026-04-04	2500	二쇱떇?뚯궗 移댁뭅?ㅻえ鍮뚮━???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	07044b15e49ab1d801ce7b58a4a4e0a7dbc33221586c5d2d156e3674eaf7586e	\N	KRW	二쇱감	18:14	t
6e7f783f-184f-4fcc-aba7-a6e416d04270	2026-04-04	3700	?덈큵?쎄뎅	?섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	172c0fc8d466150f085db630759aacb9e9acff6ed3a32948af68f07b2057482a	\N	KRW	?쎄뎅	09:05	t
de83bac0-d1a7-47c3-85bf-0be8604c292f	2026-04-04	3500	?쇳듉?뚯븘泥?냼?꾧낵?섏썝	?섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	1f9d5c6f83b8cd0b0b4f8aef441f23b4b15cbc4e5656b8c8d233acaa027bd350	\N	KRW	?뚯븘怨?09:04	t
cdeee3e2-ce7b-4e37-bc3d-cd5068cc9596	2026-04-01	7670	(二??랁삊?좏넻?섎굹濡쒕쭏???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	0deee10c0de5cd24d697d3d198493e65323964adf9e30de48bd5b174c0bce0f8	\N	KRW	留덊듃	18:10	t
e428a8d8-e060-4ab0-b7bf-067d0a7b1861	2026-04-05	48800	?ㅼ씠??肄??앹뿼??	?쇳븨	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	f969b30e87a5ccfed9dc94eb4417fa0b24db01ea8fcc8f8dbe76b3e04617c048	\N	KRW	?앹뿽??19:11	t
d47b31a7-97a4-47f4-b0e9-2c223a086f32	2026-04-05	0	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	d048f5e0c57b0be7fdcadfe8432638d1a1b1bd121b00ca374d2db84626986796	\N	KRW	?몄쓽??19:19	t
d6a21242-021e-45a9-86b2-a6507577b7aa	2026-04-03	54300	留덉폆而щ━	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	857361ae2d013fccac8216728ae817664add05e78038093bec03d8904c1e0f0c	\N	KRW	?앹옱猷?20:49	t
4dd3d0c3-704e-44f8-a189-3eefd787fa19	2026-04-02	5900	?좎뒪?꾨씪???⑤씪?몄눥??exclude	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	c9e266025a709b4aa4629c2a3153cbad13d8f70f1d13a6cf001e4e54fb3a09b4	?⑥슜??吏異?KRW	?쒕퉬?ㅺ뎄??11:23	t
bab31fb2-7e3e-4a3d-8a2b-16ec5902a05b	2026-03-21	17000	(二??먯씠?랁떚???꾩옣諛쒓텒	?ы뻾/?숇컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	45ebffcaeb67bae92e6fcbf6c30666e36a9ee9b59899f2bcda3b93c3149433d8	怨듯빆踰꾩뒪鍮?蹂듦?)	KRW	怨듯빆踰꾩뒪鍮?21:36	t
e74082c1-73e4-4188-8890-0c678a8240f7	2026-04-21	10000	?멸?移쒖쿃紐⑥엫鍮??앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	45dec028a659f6ace2c5ab71e8a6a8176db5eae989aac1e74657acc7e77d5bf4	\N	KRW	紐⑥엫鍮?08:21	t
74226f0d-b196-4a36-9645-750dbd122e96	2026-02-26	1200	?몄쇅?섏엯_KICC(李쎄뎄寃곗젣)	二쇨굅/?듭떊	expense	MULTI Any 移대뱶	39401624bbadee5dcdd05551972a3ce24e1a65bb3052280d5695807d91c88312	\N	KRW	?멸툑/怨쇳깭猷?14:00	t
88f9b955-76aa-42e7-848a-58b91481ec95	2026-04-10	850	援ш??섏씠癒쇳듃肄붾━???좏븳?뚯궗	?⑤씪?몄눥??exclude	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	78dd1f6bfd2d0f0d749edd489bb01cbe5d893a3a76d600f23c9c38d9ba347c1a	???⑸룉 吏異?KRW	?쒕퉬?ㅺ뎄??07:16	t
b088e355-d5a7-4712-9c88-8df1f7270b27	2026-03-11	36900	二쇱떇?뚯궗 ?먯뒪???뚯궗移대뱶吏異?exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	e13a436202fb9b4e211929487fbba65780035a66af20891d1e75d43caa6846c7	?뚯궗 移대뱶鍮?以묐났 ?댁뿭	KRW	泥좊룄	15:54	t
76f58719-b667-4614-81a2-caa54aa5a2a5	2026-03-31	0	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	023a498364e4fe2b9635fcf057ef83c43e5ea64cf5db36ba950ede844c6baaa3	移댁뭅???ъ씤???ъ슜	KRW	?몄쓽??22:11	t
20119b7f-f5b4-46a5-9b89-37484986ff9c	2026-03-30	40000	援먰넻 怨쇳깭猷??댁껜	?먮룞李?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	775ce002eaf9ebc33bb6789bc6e801c72494c77ebdc9097efd18d4fde9f418b3	援?李⑥꽑蹂寃?源쒕묀???덉섕	KRW	怨쇳깭猷?09:19	t
db082171-0988-437a-8388-028b5fb9084c	2026-03-23	1000000	異쒓툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	e3438d2276e5208f04d4def851b17c79b06694e4afbb77633c159c7c40a9d494	?섎굹 ?듭옣 ?댁껜 ?댁뿭	KRW	誘몃텇瑜?09:07	t
3c3b699e-9346-4347-b2ae-200588b1aa00	2026-03-15	44000	?꾨?諛깊솕?먯쿇?몄젏	?⑥뀡/?쇳븨	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	5440d8586b1fac93324c53dcf3b09c2e1d7742d93165e3d3d8c531cf5a111b29	\N	KRW	諛깊솕??10:34	t
17bc65e4-701b-4820-a2dc-7966f963949d	2026-03-12	301350	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	a9968a0ffb3640e2ae6736e2b210a3c610a8f51174e014bf574add82fed1dd40	?꾨?移대뱶媛??댁뿭	KRW	移대뱶?湲?21:35	t
3365426e-4466-455d-9e26-c28d38344b9b	2026-03-10	7000008	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	9143f52588142dc2e37f24496ca665fac434d809ea6eb3b6d6edfc688e486fdc	?깃린鍮꾩슜吏???섏엯 誘몃컲??	KRW	誘몃텇瑜?09:12	t
5a2c2929-254c-4aab-a497-4469a45440fd	2026-03-05	0	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	7e2fcb078ff43b2179adf36060e478a680fa88d3a5d32783e52ed926207e5aa5	?ъ씤??寃곗젣	KRW	?몄쓽??23:10	t
f3a3d6f7-adbc-4742-adb1-b26327de7e11	2026-02-19	3520	?명띁?ㅺ났?앸ぐ	?먮?/?≪븘	exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤??	921295473c444b8b00c4624b37ffc724d4d9a657f2d4a07e7b46512d5849a3e0	移대뱶?ы븷???댁뿭	KRW	?≪븘?⑺뭹	18:10	t
2799cf98-e4c5-4a10-b385-8c37e7c63daa	2026-02-18	700000	異쒓툑 ?댁뿭	寃쎌“/?좊Ъ	expense	?⑤씪?몄옄由쎌삁?곴툑	be128da5d3d72457526dbc6b8f941326a9d350cba87f228f30037de90164f0b1	?λえ???ㅼ슜??異쒓툑	KRW	誘몃텇瑜?13:56	t
3e1ec8b5-0339-4611-81e3-f460b5971239	2026-02-13	90420	?꾨??댁긽?붿옱蹂댄뿕(二?蹂몄젏	?먮?/?≪븘	expense	LOCA 365 移대뱶	455a68610dc1d0b4709c1b9599f09d739272d8294117fe88a442805f53944bda	\N	KRW	蹂댄뿕	15:23	t
87a1ba25-7052-4e64-bdf9-c7e275a2be3b	2026-02-27	3200	?섎굹?쎄뎅	?섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	4e0ab95f86fc662a23b248e0ebee7aaa8dd2584cf45237a94068d79182b3ad82	\N	KRW	?쎄뎅	11:52	t
80f0b2a3-def5-480a-8775-65c59294c23c	2026-02-27	1500	?꾩궛?щ옉?섏썝	?섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	ce134c6d663be4fb0d6d8753c3457147e412bc306e802be186536fddbde78e45	\N	KRW	?대퉬?명썑怨?11:51	t
1f0683ca-a586-441c-b37c-e4e3e56af4ab	2026-02-27	2100	?ㅽ룷???臾명솕/?ш?	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤??	60aebba89689e83fd1a0d5d042e7021a743cc69c8690d9c8b9d5412267edf6ec	\N	KRW	?ㅽ룷痢?11:10	t
8b6b1219-c2b5-4318-a101-d7a526a25adb	2026-02-27	26800	?ㅽ룷???臾명솕/?ш?	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	f6013dc1f38567b17f2e38bfad357f229ceb6a6e5529a4a1afda6bd49ad2cdfa	\N	KRW	?ㅽ룷痢?11:10	t
4e5706fe-99e2-4150-9a5e-65ed3daf2419	2026-02-26	12690	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	97efa182aa03d9295cf085c9a4ef0313918ea14309a5ab4405909a38a6fa3467	\N	KRW	留덊듃	18:29	t
201be63d-fcb7-4ee0-b935-b6f68f6b4d48	2026-02-26	42000	怨듭엫?섎씪 ?쒖슱?≫뙆???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	8bd58da27e8d10b368fb20d34e8841338e70e6433f84e756f59f77276d244e84	\N	KRW	?뺣퉬/?섎━	12:55	t
e3a8d38b-6e42-4990-96a0-e55a457d5e5b	2026-02-26	14600	移댄럹?쇱씠痢??〓━?④만	移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	88e949206107d51dc17a024c83bad817266b7cdbeac77cd42d7432948836c0c6	\N	KRW	而ㅽ뵾/?뚮즺	11:36	t
5d876221-5d12-469a-885c-723ab7253bf0	2026-02-25	36870	荑좏뙜_KICC	?⑤씪?몄눥??expense	MG+ S ?섎굹移대뱶	a6b959916e33d4e8c55c7789b7f5b1c2cc4ae2e4eb922fc3eb427cfe3db2ac73	\N	KRW	?명꽣?룹눥??19:42	t
231478a0-f30b-4939-9e76-82dcc12fb4fb	2026-02-25	29600	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	b116aaf3cd2a2950d00f774d7c1799d3f1bccb6febf92ba085014c34109bbf41	\N	KRW	諛곕떖	17:38	t
e2add33c-d91d-49b0-876b-fadfb713fc91	2026-01-26	47790	?숈뼇?앸챸 ?異뺣낫???異?expense	?쇱쬆?댁껜	15cd5622f1112bfefd61cbd32513a54d77fa884ccf7048942a7b3475d4582fe3	?⑥?異뺣낫??KRW	?異뺣낫??10:00	t
46931715-d09f-413e-8100-9a269d0f9c7a	2026-01-26	109280	?숈뼇?앸챸 ?異뺣낫???異?expense	?쇱쬆?댁껜	4af9554ea429d5c3cf2856da112d92aa62143bf4893143c494840857f257e211	?⑥?異뺣낫??KRW	?異뺣낫??10:00	t
87767e21-9c39-4745-bf8d-27cacd95e564	2026-01-31	11800	醫뗭?怨꾨? ?띾궔???앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	5f42564aaf8bc0150b061e177e7a2bc3255e966bdef68df716198c792d4145fc	\N	KRW	?앹옱猷?17:30	t
8e039f52-e914-487f-a0b5-e74a8ea855a1	2026-04-30	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	b89555b659cc120ad137c40a059c6b2854dfaad45d0fe3229cf69b34557e1dee	\N	KRW	?以묎탳??17:04	t
9e480ebe-7b9e-441a-aba8-2d8cbceb35bb	2026-04-30	31500	(二??뚭낵??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	32a3ba8e1650a1b904b0b8dc1079b0f19d63344e0e96a55f1f8f6abe154e605a	\N	KRW	?붿?????12:48	t
b63688be-3702-40aa-a923-5c413e42cc9f	2026-04-14	1	LGU650	?댁껜	exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	0a548e88389af878fdc2a1d57fda68e1a28893b129ce73c1eaa08424d6df5c97	???⑸룉 ?듭옣	KRW	誘몃텇瑜?17:07	t
5b53f7c1-bb68-4d2c-9325-63cdc3333f1f	2026-04-14	1148342	濡?뜲移대뱶	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	51701d5fc4ace90fb0b3a1d3ed9b02257b61a5d8341b451aa30ee28f495bd497	\N	KRW	移대뱶?湲?21:36	t
2e579ac2-50fe-47b8-a8e8-aeca341e8ef4	2026-04-13	160000	?뚮??대┛?댁쭛(?쒕룞鍮?	?먮?/?≪븘	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	97ded747de2afaeb2af355488f533da01ef54897ace4c83aecdb3a143e52487f	?대┛?댁쭛 ?쒕룞鍮?KRW	援먯쑁鍮?15:09	t
89e661ff-a965-4101-9f40-ff3a8c61f2e4	2026-04-13	1013799	?섎굹移대뱶	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	e6fa4b5cf5370b6996652158d28f33cfb49a2bc9a1ee215a962923a6c280e9be	\N	KRW	移대뱶?湲?22:06	t
123e6409-62da-49d8-954a-6bae5e3caa07	2026-03-29	13600	?섏씠釉?移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	fbf88ad52523c2b1b5ef126165b4394e5b99e399a64ca79107ef0b1d4cd6b7b3	\N	KRW	踰좎씠而ㅻ━	15:21	t
d5c99973-91f8-4f16-8803-9e42a051fc40	2026-04-21	1000000	?섎굹?듭옣 ?붽툒	?닿퀎醫뚯씠泥?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	7792c953d28c49ac2366716bf497ca689dcc2b28cbd24ff2d0e8c3aa3ad0e493	\N	KRW	怨꾩쥖?댁껜 ?대젰	08:21	t
86ec449f-b9ae-46d4-945b-267d87314dbf	2026-04-13	1184770	?섎굹移대뱶媛??닿퀎醫뚯씠泥?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	1db754f3fb6a938fcef4c2eb849ed0bd6e2ade07844e9b4bccf33566c3e77dba	\N	KRW	誘몃텇瑜?08:16	t
8925022d-cf4a-4d3f-82db-8069195fa24c	2026-01-26	48362	援먮낫?ㅻ퉬蹂댄뿕	?섎즺/嫄닿컯	expense	?쇱쬆?댁껜	8bd0c7c3c597bf3264c5fb0be00a91dd0f5dc2eb80ded0f772f018609d0894c8	?⑥떎鍮꾨낫??KRW	?ㅻ퉬蹂댄뿕鍮?10:00	t
7ac63ee9-ca5c-44fb-9382-fbe6be1127be	2026-04-02	100000	?섏쭊 吏痢??붿꽭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	2459897e55224ed8e2d6083c059b7086344d554e70606ed4b4c141cedfbf12e1	\N	KRW	?붿꽭	12:47	t
91aa83f2-ecb8-41ff-8f17-6976a6dd44ef	2026-04-27	1	援곗씤?껋쓬	湲덉쑖	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	aa98a151d82d2fe629a2b4e03290e769b0444ce1d81a15e4964b16e487b2ca20	?몄쬆 1??KRW	誘몃텇瑜?09:41	t
99bb4fff-7eb9-4eb2-a013-845fb2895408	2026-04-21	20000	79795448552	?ы뻾/?숇컯	exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	3dcc76873525a223aae32fb0e10cd2cb270ad732dde3f857e9c257c51c850825	??紐⑥엫鍮?以묐났 ?곗씠??KRW	??났沅?08:21	t
e76aaf3a-0b7f-4d54-b420-dddfc01f9f23	2026-04-27	2000	INICISPOINT	?먮?/?≪븘	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤?? (移대뱶)	5c2420360a04098d632b21070f0af86a2b42710f9e1dc8fd6c67b35fe837f6da	媛뺣룞?대┛???異뺤젣	KRW	寃곗젣/異⑹쟾	10:02	t
30cf0017-7c42-4b1a-a989-94b67b38399f	2026-04-27	37050	留덉씠?щ줈?λ낫???먮?/?≪븘	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	3d803eb32441f82399a1184b37189ee3657974dfa3e0e0bc9a1ecc7b5d4c6f05	?λ낫???좉낡 ?명삎	KRW	?ㅽ룷痢?09:58	t
ee8e17a0-7179-499a-93a9-aabddb8707f9	2026-04-10	69800	?덇??쒗궎利?蹂몄궗	?먮?/?≪븘	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	826d0d1687f959df98e84a0028d3c795ab5f7458b979e48fcae414501130972b	移댁떆??臾대쫷 蹂댄샇?	KRW	?≪븘?⑺뭹	15:49	t
c7e44f39-f22c-49e4-b8d4-d84edb803199	2026-04-01	602719	?섎굹?듭옣2,3???붿뿬湲??낃툑	?닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	01726887a91a4c87652867b33f60f00866e002b79514538329396a0868400366	2,3???섎굹?듭옣 ?붿뿬湲??낃툑	KRW	?붿뿬湲??댁껜	09:19	t
fb18b6d1-4f9a-449b-97ae-4273a85bdad0	2026-04-10	400000	怨듭슜鍮?吏??怨듭슜鍮꾩???exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	1b23e118765822ac12fd414f504ab6166b9a7fcacd982ea9ce5de70b46663775	?뚯궗 移대뱶鍮?吏??KRW	移대뱶鍮?吏??09:51	t
2b4d50b4-d467-432c-afcb-a61756d60b66	2026-02-28	1000	?띿뾽?뚯궗踰뺤씤(二??쒖뒪	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	d85107ec4befdb7cc07665c18d7b8d6b7ce93bad212bf9d276997a4715fb5011	\N	KRW	?앹옱猷?14:54	t
f0688940-30ce-4ffe-8fc0-1dad7d404785	2026-03-31	5870	荑좏뙜?꾩슜_KCP	?⑤씪?몄눥??expense	MULTI Any 移대뱶	b015a6ed2a298d7ee15b7ebb3fa3756b22d7712e701916a6ff37a4b4be742a6b	\N	KRW	寃곗젣/異⑹쟾	18:11	t
4622ee8d-631b-4f0c-b90b-2dc230096d53	2026-03-29	600	?ㅽ?踰낆뒪肄붾━??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	57e91846ef516846133a256bc7e994994dbc8d20bd41e22a1194a03da1dbd57c	\N	KRW	而ㅽ뵾/?뚮즺	15:27	t
a3909165-02dd-4ba7-8301-9ca895eb4528	2026-02-28	116000	?좊챸??텋??컝鍮꾩쟾臾몄젏	?앸퉬	expense	MULTI Any 移대뱶	d6c01099944c75868cb3ae8577e3fd3f166deacaf525ecc9a945250b24e7fbbf	\N	KRW	?쒖떇	13:36	t
1e6cfc06-93aa-4928-893f-552b688a1601	2026-02-26	14270	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	a48f943c8bc56656563e370832745b4975f86a321b47e4e38169e2c78f0b49f0	\N	KRW	留덊듃	19:25	t
b436bb08-e259-4d09-8df0-3c5f4c241c52	2026-01-30	3200	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	9daf90484698eb64a6a174df7c620bae9fd0e96bcb5d4d2999bff5d0cad7f316	\N	KRW	踰좎씠而ㅻ━	18:01	t
b303723d-672c-4f16-a32a-7a5f0ffd587c	2026-01-30	1520	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	d46c553c17af0c7f6c0f8fd11289eadaca997be7c6c6412b88b058ff767b8a2b	\N	KRW	誘몃텇瑜?17:58	t
c18a2d6d-a38f-48f0-a00b-eb0a73587900	2026-04-29	19400	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	4bc03b8f9d02106e313ebe917491a44b5faa3a939e60c2ffcc87667aae199e56	\N	KRW	諛곕떖	19:49	t
6aeedd85-b303-4b2d-a5de-5db3219549e9	2026-01-22	100000	異쒓툑 ?댁뿭	?異?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	4a75e5db257ff5fd44312890121f5d06424452ab4ee373b199c0aa28d1d3cc67	?섎굹?듭옣 10留??異??댁껜?댁뿭	KRW	誘몃텇瑜?04:22	t
d3a3a9f0-f985-4e57-9304-858021029bcc	2026-04-01	153	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	e576a0ae5e433ddd1d07fa25db1c2afd9e8bf301ab7e60c3c75afb77dd6ca01a	???⑸룉 ?듭옣	KRW	誘몃텇瑜?04:50	t
857ce5b4-4a33-4619-93c7-24e381a244ad	2026-04-26	20000	(二??몄쭊二쇱쑀??寃쎌썝吏???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	5ac7cd1af05fca30bc18add2e8aed1386f2304123db9da627243853e3f1ed3cd	\N	KRW	二쇱쑀	07:44	t
7a81e903-66d3-4eb1-8be7-df256113c67d	2026-04-05	9000	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	af8f7f8a197cc08ef4a4284172a57706bca39d7bff79e87615ef7f19274a2fe8	\N	KRW	踰좎씠而ㅻ━	16:00	t
c881ef2c-9397-41bf-a334-d5ac216d874f	2026-04-01	5400	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	daac165bf921cdfdd8d92bc073ffc6b499d44f2c1a9197f6d159ab6221867f3a	\N	KRW	踰좎씠而ㅻ━	17:29	t
a9ecc2c4-cd3c-4e10-b22d-a9ed3cdc7735	2026-04-01	22850	?덊뵆?ъ뒪?듭뒪?꾨젅?ㅽ뭾?⑹젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	04d51df0ab6ef0b170307ff4d8c3d0c4a09060511db5773e540911557e7e68a0	\N	KRW	?앹옱猷?14:28	t
84a66f97-b421-40fa-b033-66d60489297e	2026-01-12	64760	KT?듭떊?붽툑 ?먮룞?⑸?	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	9bcc938166c76d9dd157c52e5cba68c96b5465d2dc3d799631d252b7eb90677f	援ν룿鍮?KRW	?대???14:11	t
fbbc5ccd-65d6-425e-a374-3df8b00794d6	2026-04-01	0	?낃툑 ?댁뿭	湲덉쑖?섏엯	income	?먮뱶由쇳넻??(?댁껜)	5a20a686f831115cf5730aecb6441da1d02725bc0c583e6abe31565a518154ec	\N	KRW	誘몃텇瑜?05:10	t
cb8befce-a494-48e6-a295-58ee62ae5a94	2026-04-29	2327	GS25?띾궔?꾨????앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	aec78f06c82c0c32c9033c2688a2976319a1ff81fc4848eb9458a4d599728e07	\N	KRW	?몄쓽??18:20	t
e3e0ad0d-62c8-485f-94a0-2aab7ba81b85	2026-04-01	602719	?섎굹?듭옣2,3???붿뿬湲??낃툑 	?닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	ccbf6f717a2f562b118cb08958d6ffb3d55b4e1d5cef7a7271ac4b8138e67ff9	\N	KRW	?붿뿬湲??댁껜	09:19	t
77579ea9-0254-4ff0-b1a4-123e41ce8704	2026-04-01	602719	?섎굹?듭옣 2,3???붿뿬湲??댁껜?대젰	?닿퀎醫뚯씠泥?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	fb2a9136ebf122e7942afc7a287b9fa47eb7dbed6d052e5bea9395ef98197d4f	\N	KRW	?붿뿬湲?怨꾩쥖?댁껜	09:19	t
6e3b5468-7094-4215-b5dd-461fc3076180	2026-04-17	19320	濡?뜲?쇳븨(二?濡?뜲?덊띁Mark	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	2acab331d0c509c5a8e3c1a8e7e1be02d2fef3bfce0743a9081285cb7772f3a0	\N	KRW	留덊듃	20:51	t
c6570603-d228-4f9b-9917-80802e1fec61	2026-04-30	71200	鍮꾩븻鍮쏆븞怨??섎즺/嫄닿컯	expense	MULTI Any 移대뱶	7781de472ff8910b2eff0f6359d888820a1b309e8720ef70e9f59bc95f164ba0	\N	KRW	?덇낵	11:59	t
6de35809-bee9-4b73-afa4-a43ede39332d	2026-04-30	1650	寃쎄린?쒕궡踰꾩뒪_?대퉬	援먰넻	expense	MULTI Any 移대뱶	04c32e9c10ef960089ef469a8e445a48342c28f4f49df51f8f2406dd7d6417f2	\N	KRW	?以묎탳??07:39	t
855f4610-2399-4b30-99e0-9d82e816e8fb	2026-04-29	6500	援ъ떆?꾪뫖?쒕쭏耳??앸퉬	expense	MULTI Any 移대뱶	e65a56a7491a7a447e81a53e60960c3f07fa6e3f263a2d76b70809828e459918	\N	KRW	?꾩떆?꾩쓬??13:22	t
1fcc4d27-0a42-448d-8e23-83c5adcca60c	2026-04-29	3900	諛붾굹?꾨젅???댄솕?щ???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	350ae719491f92462aafa93b747975b92ca1f9f6847bf09b341c3cec297dfb87	\N	KRW	而ㅽ뵾/?뚮즺	08:41	t
905bf6fe-0739-4b08-b278-2ba37c491fc1	2026-04-01	10000	?≫뙆援ъ쑁?꾩쥌?⑹??먯꽱???먮?/?≪븘	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	45d16db50500e44934f3a985fba89be231b39dbde3527b86ae41adcb0fd86031	\N	KRW	?뚮큵鍮?13:35	t
3d007041-b650-4367-9aad-7f2fa6f69b21	2026-04-30	15300	吏?고??뚯빟援??섎즺/嫄닿컯	expense	MULTI Any 移대뱶	95a8c000403a1dbb9f06d5ddc5371d29f6e6bb2a86d8d6e4f93d2818d1b3d313	\N	KRW	?쎄뎅	12:12	t
fd79e222-b5df-470d-889d-491808b3c8e7	2026-04-30	300	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	913339beb7a77d0e8bf2617a97c0333dec3bb1a641a34afc4ac197d7f621a642	\N	KRW	?以묎탳??07:55	t
d79ff4ff-c1bd-454c-890f-b5c8e4bf7f48	2026-04-01	9000	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	a76cdedae5217b590b63009c5ba52d6478f1afa23f1c57799771e7f7b6e7d640	\N	KRW	而ㅽ뵾/?뚮즺	08:52	t
6976e3bb-58a3-42a0-9249-d8ce4de79d0a	2026-01-29	5000	?섎굹?쎄뎅	?섎즺/嫄닿컯	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	e2678341250c43889e2462ec4e271ada652cb175bff5b8ac4e4ef04d07bcf09a	\N	KRW	?쎄뎅	15:56	t
447c2118-7a02-4d86-8d0e-ace5f89e0a02	2026-02-26	200	?몄쇅?섏엯(ARS)_?ㅻ쭏?몃줈	?먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	dcd9860f108ad15ff6c92c7b97004dda50c522ffe4572e25084d4c7e58333a1b	\N	KRW	二쇱감	14:09	t
d81918ea-3179-42bb-8933-74ea4d43954b	2026-01-02	2100	GS25 ?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	af6035bdf3ae2e2284f1492cc5f1ace95caf231281e8defcef32a78655c139e7	\N	KRW	?몄쓽??20:58	t
29c0d835-03b1-4af8-9bee-05f6b2ee7ff5	2026-01-03	70000	?꾨━吏??섑듃?덉뒪	臾명솕/?ш?	expense	SK?명뀛由?뒪 X LOCA	16414e868e864437af49e708471aa004c292205cbf67bdbc73c490657bf4dc65	\N	KRW	?대룞	17:28	t
bbb99c0f-da0e-4ff9-a5c4-e78b7bb102d4	2026-01-17	150000	?곸쿇?ㅽ듃?뚰겕(二??쒗씎??섏씠二쇱쑀???먮룞李?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	cf7f6d66c96b2ce82558b4dff9ccd182abfa0be48af8147e74431fb4cc2134c4	媛???ъ쟾 寃곗젣 痍⑥냼 ?댁뿭	KRW	二쇱쑀	13:03	t
ef0f9b7d-042f-4d4f-ab69-312f96e17754	2026-01-27	3700	?⑺솕諛?移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	55bfe95f2afde292c90d6ab032708506c32c765602fd2d3fc4c0383a76ea1a0c	\N	KRW	而ㅽ뵾/?뚮즺	14:52	t
46db2491-64fd-4e46-880a-27d904b981a7	2026-01-27	345160	?꾪뙆??愿由щ퉬	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	e1f7ed85659e593e8c6dcae23be060bb54d741da27271d90cccefc5aff57137e	\N	KRW	愿由щ퉬	14:08	t
bc1f9f58-d3b0-44fd-979d-c1a2cc7dcda2	2026-01-27	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	44f0da531c006a7930a111bb658be48e6cfb676c72a6c9dbf2bcf9396361bba6	\N	KRW	而ㅽ뵾/?뚮즺	08:27	t
d4ef4838-c444-432b-ae17-9bdf16d063b7	2026-03-27	3900	?곗?而ㅽ뵾 ?댄솕?щ???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	77278918d036b0501ff15b08f22dac49bd64ad566ae77dc062525ecea467ebbd	\N	KRW	而ㅽ뵾/?뚮즺	08:46	t
adb65a87-c8c6-4156-8c58-ffa523f6cb9e	2026-02-25	59500	?좎꽭怨꾨갚?붿젏 媛뺣궓???⑥뀡/?쇳븨	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	44a035b70bae2fa89a5727e3084dc2cdb60a78674ddc96e68132fb819065f1bc	\N	KRW	諛깊솕??16:11	t
85b4dbab-4f3c-46cf-ad74-d3cf7d6ebe4d	2026-04-30	18000	洹몃（??GROOT)	?먮?/?≪븘	expense	MULTI Any 移대뱶	a01597029318416efe2317788974a200aa821445051c6a49411af7fd3266a5f7	遊됰큺 ?ㅼ뼱而?KRW	誘몄슜??09:41	t
da41dbf9-7057-4c9f-a80b-5f06312dd0b5	2026-01-23	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	ba475bc271c9007a1a0ed838ed9d4e093f4807b672706323df3fa3836216d712	\N	KRW	而ㅽ뵾/?뚮즺	08:49	t
e5f05162-81a2-433a-9b54-809381fdbdaf	2026-01-22	8300	?명듃濡?臾명솕/?ш?	expense	MULTI Any 移대뱶	77ac4a6fb156a63c6bda56cc0da76ef920cddf35494f9f8b49c79a7a0f8e6861	\N	KRW	?곹솕	16:33	t
2a2cfc7b-c9a1-4838-a121-8848da73c745	2026-02-22	10530	?꾨씪留덊겕(二? ?섏뼱洹몃씪?대뱶?좎큿??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	3094252674d89d2ecb131c43923c5f100922d0f33805fd63f422658f2c4afd83	\N	KRW	而ㅽ뵾/?뚮즺	13:41	t
a41a2333-6d96-47d5-bdd5-6ced7619d6d8	2026-02-20	6000	(二??꾩씠?쒕뱶	?⑥뀡/?쇳븨	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	dd20f3c9ad36cc9c228097fa70cbc9a5239812d0cde10177289cf67ea8b869e1	\N	KRW	?⑥뀡	14:36	t
5c5af0bc-2c82-4dd5-8981-42e766a5d711	2026-03-23	1700	硫붽??좎??⑥빱???대???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	48b4971a14c9999b071a307568e699b50e5c5b752b848f7789d7cc7448d8edde	\N	KRW	而ㅽ뵾/?뚮즺	08:35	t
1df9e8ef-c004-4a21-89b5-a62d06357f77	2026-02-11	1800	?⑥쑀(CU) ?댄솕SK?붾젅肄ㅺ????앸퉬	expense	MULTI Any 移대뱶	15f540c69504d38fcec3dc9ff609ac88dfcbe969f83e052af4e6858d514ae872	\N	KRW	?몄쓽??09:07	t
d0f904a1-c85f-421d-b12d-4f489331a9d7	2026-02-19	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	05d0fbc0a9a628692e8de4b21157e8b359581737077cad6fae79c8e8fc2efaac	\N	KRW	?以묎탳??13:31	t
d7a40626-673c-4516-a47d-aa879dcc7bc9	2026-03-20	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	64dc434e66cc670488e0a8ff10d300e7045b03016197708e2c4c7b696a0b7fe8	\N	KRW	?以묎탳??12:51	t
a0671129-76bf-41cb-ad3f-ff2786df1617	2026-03-19	39300	?쒖슱?ㅼ쐞?몄튂怨??섎즺/嫄닿컯	expense	MULTI Any 移대뱶	c47cedb85fc607eb632cec28975c37aa1de14bc6ec0d9e7c5f69ac65e1a7ef1b	\N	KRW	移섍낵	15:33	t
65485ecd-0627-4967-8ade-92bf0e161f48	2026-01-21	10000	?ㅼ씠踰꾪럹???⑤씪?몄눥??expense	MG+ S ?섎굹移대뱶	0de1c83b1a79f04b647857ecd9c57907ecd524a3568e2622c89bd89145fc6604	\N	KRW	?명꽣?룹눥??00:00	t
457e54cc-a540-46c5-ae23-efca43131d31	2026-02-05	2398	?좎뒪 釉뚮옖?쒖퐯	?⑤씪?몄눥??exclude	?좎뒪 媛꾪렪寃곗젣	0c802a207866085189a42f444edbb68493277003b870c0fb7480072464d4db3c	\N	KRW	寃곗젣/異⑹쟾	17:15	t
f8ca1fc7-d719-401e-84f6-33d742e3e958	2026-02-12	6700	?먮윭???댄솕?щ????앸퉬	expense	MULTI Any 移대뱶	49a5a4721b01109a49c75679f900b0bc90142b8797f98c48a6fc61b04b708404	\N	KRW	?⑥뒪?명뫖??13:22	t
001beb18-7794-489b-80cc-43b686047021	2026-03-14	13480	荑좏뙜	?⑤씪?몄눥??expense	?ㅼ씠踰??꾨?移대뱶	06f6659272f5f30dd824414115a32807257211f137d695970c6f71b6d6f6f635	\N	KRW	?명꽣?룹눥??15:04	t
3ade8172-a75a-4387-b446-44ef1564cd54	2026-01-16	28686	(二??먮Ⅴ肄붿뒪 ?띿뾽?뚯궗踰뺤씤	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	a2aa40e46929d2c46ff0f38f241f5ca59f41ec84c26a955b7088d6cf3a96bfb9	\N	KRW	?앹옱猷?19:06	t
3bd1a9d8-3ab7-47df-a8d9-a5c2fc073a1f	2026-03-11	9000	?먯“?좊ℓ援?갈	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	a8b488492caffef0ecc2dcd3839dbe68fdad60fdc9969093c833a234dfa31c22	\N	KRW	?쒖떇	11:40	t
a3e870fd-2ed6-4eb4-afb1-c42bd65a9f72	2026-04-29	10000	??洹??닿퀎醫뚯씠泥?exclude	移댁뭅?ㅽ럹??癒몃땲 (?댁껜)	210932d60485d2125d581e895ec8db62c1c0eab1ab61bdf965a9d14465e5cc2f	移댁뭅?ㅽ럹??寃곗젣 ?먮룞?댁껜	KRW	誘몃텇瑜?18:19	t
b3ac4003-c85f-4662-92ff-f6a3e39a6864	2026-02-13	3000	怨듦났湲곌?_KPN	二쇨굅/?듭떊	expense	MULTI Any 移대뱶	f1e75ddc4f8c578fef2cd6b654ebe7a543e74e6afe6b880b362033a085fe8e97	\N	KRW	移대뱶	10:08	t
9f7f4d97-091a-42f3-970d-7f68283fcb2b	2026-02-26	1000	?낃툑 ?댁뿭	湲고??섏엯	income	?⑤씪?몄옄由쎌삁?곴툑	42f7902fb0836a7ef06e1e9ad0f40d621afcb88df7817e659bfc17b7db0faf5f	\N	KRW	?댁옄	12:23	t
2bd9da6b-8ae0-4498-b4f9-267cb475bf6f	2026-01-12	7500	援ъ떆?꾪뫖?쒕쭏耳??앸퉬	expense	MULTI Any 移대뱶	1a3bc94323e93395fe70e6b9d1d101c592cd98e1be4ccee92eade23a97ce8756	\N	KRW	?꾩떆?꾩쓬??13:48	t
de41839c-703d-41ca-9b86-cc1754726376	2026-01-11	21000	媛먮?移섑궓	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	a4990d1db6b6d46258656746d8f4e396b716e139f7175119396358daf87b034c	\N	KRW	移섑궓	19:57	t
afdc3ec8-7ed0-4968-ac99-78998c6a7daa	2026-02-26	5414000	吏?먯껜?몄엯湲??먯튂?⑥껜)	二쇨굅/?듭떊	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	50bac9faaf6aeb8da09da3dccb47ad201ec0786b3aa3766ea8c610e0ab711251	遺遺怨듬룞紐낆쓽 痍⑤뱷??KRW	?멸툑/怨쇳깭猷?15:16	t
d463246e-1f35-4282-a03c-21e4f9c742e6	2026-02-07	95000	援щ룄?쇱꽌?섎궓二쇱쑀???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	c41803b8812d7b0293a073fe95fcc2a96330926674b510a5d585af9f8e147758	\N	KRW	二쇱쑀	11:27	t
2cedf0a5-0577-4ed9-9335-a7387ba50794	2026-03-10	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	21c48f4220f12c84ffa623cae5e7b868baf52ef1441496fd22d54207c59c25b2	\N	KRW	而ㅽ뵾/?뚮즺	12:28	t
37e84886-f63d-486a-837d-a22a925ddf6f	2026-03-08	26900	荑좏뙜?댁툩	?앸퉬	expense	LOCA 365 移대뱶	5e22de7042382b3f7ee83a6d1787d03a6d708f9a6d8c608bd0ae45a08c86f104	\N	KRW	諛곕떖	20:10	t
091a2394-99b6-4e49-839a-71f8f302165c	2026-03-06	10000	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	?앺솢	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	691f3986397ddbaf7b1b29237561175820a27912590c6d34ebae23a5a70e1107	?덉빟湲?KRW	?ㅼ뼱??08:39	t
886ec2b4-69f3-40dd-ada2-6e6207f3cadc	2026-01-07	36000	?꾨?諛깆쿇?몄젏	?⑥뀡/?쇳븨	expense	MULTI Any 移대뱶	562bd207d3bdc58c609d5a094b6a8f1d3bea5e528a8c9890f590b8e6b304895e	\N	KRW	諛깊솕??18:00	t
c7a4b687-e8b1-4ac3-9b17-555a360b1aac	2026-02-03	8800	?곕㉧?덇컻?명깮??	?뚯궗移대뱶吏異?expense	MG+ S ?섎굹移대뱶	cb62b59025052e592f8eb4fc26362e27b7be14b7397b15a31378fe459f54604a	?뚯궗移대뱶鍮?KRW	?앹떆	11:43	t
22ca7c17-062d-4d36-b161-3b10bd6d25a9	2026-02-26	400000	吏?먯껜?몄엯湲??먯튂?⑥껜)	二쇨굅/?듭떊	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	cc178a168e92c31ea61325d995a13d8ffa66ee8463a06121928fbf2619d024d1	遺遺怨듬룞紐낆쓽 痍⑤뱷??遺꾪븷寃곗젣)	KRW	?멸툑/怨쇳깭猷?15:15	t
cebacc24-51f7-4d49-81bf-a8a92e4ef458	2026-02-26	1400	?몄쇅?섏엯_KICC(李쎄뎄寃곗젣)	二쇨굅/?듭떊	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	0700a8e16a34ff94b9b8c5e647782e3f9aa9e076d60e4abc8349086a8149f2df	\N	KRW	?멸툑/怨쇳깭猷?15:05	t
07410ab8-a41d-4c66-a462-73a9fe583e62	2026-02-26	1000	?몄쇅?섏엯(ARS)_?ㅻ쭏?몃줈	?먮룞李?expense	MULTI Any 移대뱶	f8df067c5d2e1bfdb307f23d7b2b5f807e2880186555532695604568083cacaa	\N	KRW	二쇱감	16:15	t
f038b60e-72b4-48d9-b014-d84baed3d466	2026-02-25	6500	援ш??섏씠癒쇳듃肄붾━???좏븳?뚯궗	?⑤씪?몄눥??expense	?좎뒪 媛꾪렪寃곗젣	da14f56f34d36aac70ba5269cc8b36d9d3bf42787e7425de44b2d717d1539704	\N	KRW	?쒕퉬?ㅺ뎄??14:44	t
959caba6-f226-42fb-b6cf-e07e1490d895	2026-02-25	9490	?좎뒪?쇳븨	?⑤씪?몄눥??expense	?좎뒪 媛꾪렪寃곗젣	b8b06607a549b63b4fbc32733802d5f8e0896e150c4284c57c5bbdf06bd35c96	\N	KRW	?명꽣?룹눥??09:28	t
f94c5a70-e27c-4416-b729-39eecd9c0125	2026-02-24	5300	(二??꾨?諛깊솕?먯떊珥뚯젏	?⑥뀡/?쇳븨	expense	MULTI Any 移대뱶	7f193f55326a53c42f420410242887c0b1d7cf92499301efb283db13ea984b2a	\N	KRW	諛깊솕??19:18	t
ed1c7144-7d2d-49ae-a5a5-872aad2ce0b2	2026-02-24	17000	(二??꾨?諛깊솕?먯떊珥뚯젏	?⑥뀡/?쇳븨	expense	MULTI Any 移대뱶	882323f6c0b6c4765c92ad0e5729bb04ea0ba1cd7f8a8ef5edf96b58249142b6	\N	KRW	諛깊솕??19:12	t
191fa988-f6f1-4b90-8d99-07d65bef2da1	2026-02-24	12200	?ъ뜽?뚮젅?댁뒪 ?좎큿?곗꽭?숇Ц?뚭???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	6e2f38b224efd27bc5e51e07b1be660668a1138011cd609fab1558d4a0106fbc	\N	KRW	而ㅽ뵾/?뚮즺	15:41	t
d72ac777-9c75-497c-a442-a24d65d97e0b	2026-02-24	383710	?꾪뙆??愿由щ퉬	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	05f21eb83ebdcc43bf627d1d38eb7f2ad0bb385e1f748d5997d5e4b5d4d7f8a0	\N	KRW	愿由щ퉬	14:17	t
ed9fd1db-021b-4ce6-8034-7d630afaee8c	2026-02-23	16900	?몄튂???띾궔2?숈젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	bbe861958cc8a374b60ad55cb97d2686200299a653b8384594a36c5a93742661	\N	KRW	移섑궓	18:55	t
7e386008-fa28-4e62-bb17-ec9f7a57dad6	2026-02-23	4800	?명듃濡?臾명솕/?ш?	expense	MULTI Any 移대뱶	69b94b44b58b681875e98f0484ce74cf490af3bfbb3c1c5b4316b44c44af29d4	\N	KRW	?곹솕	09:45	t
a5bb436d-289b-47b0-abb8-578bc25f083c	2026-02-24	1200	?⑥쑀(CU) ?댄솕SK?붾젅肄ㅺ????앸퉬	expense	MULTI Any 移대뱶	e674ff2d58621502c665d6534c4ce53ea1cba93ad11299a14ea160ec985a1f41	\N	KRW	?몄쓽??13:46	t
3901f534-c68a-4e72-a763-a0e86f3c919a	2026-02-25	245400	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	a0f6e6f37a4e2ba6783a102c97101024e8b7d73886e65cba27f829b846fd3e11	\N	KRW	?꾧린??08:42	t
364cde21-2078-4b11-af97-872f6c8b7b9e	2026-02-25	50000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	741cfe76128edc2ab85a1bb3bfd091f9d2780fb9bbdbac406669f9d1d74041be	?덈쭏???곌툑 ?異?KRW	誘몃텇瑜?06:04	t
4ca5cfca-1927-43e8-8954-7584dd7dd61c	2026-02-25	30000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	eb0db31b92cea96a3c6d2acf641a8fc124a075d29dca9bfc13ccaf178e36b025	\N	KRW	誘몃텇瑜?00:15	t
97c6a906-8aa4-4d9e-a42a-3966a72cbc85	2026-02-25	46710	SK ?명뀛由?뒪_?뺢린怨쇨툑	二쇨굅/?듭떊	expense	SK?명뀛由?뒪 X LOCA	39e10c84ccb1cb3726994df18f3daf3c0f4a0304d30c1c709582e5244b8f5a1d	?뺤닔湲??뚰깉鍮?KRW	媛援?媛??10:56	t
00fdac60-9344-4a41-8ef5-d06b7db8d200	2026-02-02	14100	?섏씠?⑥뒪 異쒗눜洹??먮룞李?expense	?꾨텋 ?섏씠?⑥뒪 ?듯뻾猷??꾩슜 移대뱶II	f8c2c078b10c7cea7276d7e7f6df15398f5b52937222e65b1a6b784188bf9738	\N	KRW	?듯뻾猷?00:00	t
b807d97e-7e5c-4e0f-ae5b-bc529a3d1518	2026-02-02	3200	紐⑤컮??踰꾩뒪	援먰넻	expense	LOCA 365 移대뱶	69f69750d6729c45fc597412fa2f5b931026fda888101778d01cdec8230a39ae	\N	KRW	?以묎탳??00:00	t
d5042c48-c4c2-44a2-b3c8-32781bafe6ce	2026-02-02	69300	紐⑤컮??吏?섏쿋	援먰넻	expense	LOCA 365 移대뱶	9115aea860856d8b6906025943ea497eb4b36e5da5ba7db93081e45132b416f2	\N	KRW	泥좊룄	00:00	t
3da4144c-81bc-496a-a225-ec982f0be4a6	2026-01-04	9900	?꾨?諛깊솕??泥쒗샇???⑥뀡/?쇳븨	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	15d338256b7f054e4199e21a54c0c7a2d9c6e6e9c3e38bcf019cbca9ba2814b1	\N	KRW	諛깊솕??18:15	t
a267045f-f23b-4357-879a-16ca127a25ea	2026-03-25	111750	?숈뼇?앸챸 ?異뺣낫???異?expense	?쇱쬆?댁껜	993027e953a5aedba73a355f9fef35f79bfcc2785deafa0bd4b2c9849d0cbb0b	???異뺣낫?섎퉬	KRW	?異뺣낫??09:00	t
1814576e-9fb3-4664-af3c-243298624905	2026-03-25	47790	?숈뼇?앸챸?異뺣낫?섎퉬	?異?expense	?쇱쬆?댁껜	16cbd17a1f290d345ab75e1946c0dd5af245f60e47235eedee766d54a9ca873b	?⑥?異뺣낫?섎퉬	KRW	?異뺣낫??09:00	t
6c8e8f3c-afe4-42d2-a6ec-2533c8251f68	2026-03-25	109280	?숈뼇?앸챸?異뺣낫???異?expense	?쇱쬆?댁껜	bcfd13561055e291655f99f436942b7e0efba3389314e1461ee567cd8cbef127	?⑥?異뺣낫?섎퉬	KRW	?異뺣낫??09:00	t
6fe06cb7-fd09-4277-b1a7-a7a4f52e9e42	2026-03-25	48362	?⑥쓽猷뚯떎鍮꾨낫?섎퉬	?섎즺/嫄닿컯	expense	?쇱쬆?댁껜	4a119b54871d000c2fa01f96d17352d74343a84644f334c6d9299e49d0e5d43a	?⑥쓽猷뚯떎鍮?KRW	?섎즺?ㅻ퉬蹂댄뿕	09:00	t
c47a4a33-b084-4a51-9960-410f075970e3	2026-03-29	1650	寃쎄린?쒕궡踰꾩뒪_?대퉬	援먰넻	expense	MULTI Any 移대뱶	8f2ce719e4ed630606dae70384ad4ab705fa1ab2e06bcadd72bdd15b28447051	\N	KRW	?以묎탳??12:17	t
1116c524-b472-4faf-aab7-3fca4cf45eca	2026-03-28	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	dc11273c03435a25751840b5ea61af8125baed358d23809fb85b59e4b0eb5bf1	\N	KRW	?以묎탳??18:34	t
de1efc32-1249-4715-91d1-b7ca7ad495ad	2026-03-28	11000	蹂몄＝?ㅻ퉬鍮붾갈 ?띾궔?숈젏	?앸퉬	expense	MULTI Any 移대뱶	e7a9c9fcc5edfe4cc578173a8c92a1f51715a993182e603509edcc8ce23dd075	\N	KRW	?쒖떇	16:59	t
3db09559-5483-4d04-993a-25f9fd1754c9	2026-03-28	18200	誘몄뒪?깅옒鍮?移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	7e0cf304697c27b99201b61be5fb201d1015d20563da9abf0b855561ce9acff1	\N	KRW	?붿?????13:58	t
79c0a588-da2b-420a-8c52-4d946a0a30bd	2026-03-28	17500	?쒖슱?ㅼ쐞?몄튂怨??섎즺/嫄닿컯	expense	MULTI Any 移대뱶	37bff707327f2afd6b0faebe1115f468744b38e3e6f9fd9ff7f6dbe628ae207e	\N	KRW	移섍낵	13:16	t
74efd00d-2807-48e7-8360-936b3d825f59	2026-03-28	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	c5faec866e76cfd20d66f18eff130d686cca05c48f52dbaf47a4c35671555e65	\N	KRW	?以묎탳??07:50	t
2420eab4-7d4c-4322-b7d5-139abdf0bd93	2026-03-27	5650	?뚮━諛붽쾶??移댄럹?대???젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	8c87bdcb41f6cdc85625af52faeb20548cd3467f82351ad512a74f04fdb8c6e3	\N	KRW	而ㅽ뵾/?뚮즺	08:43	t
f3fbdaff-9cb6-4cf7-aea7-4ac3826a74af	2026-03-25	355850	?꾪뙆??愿由щ퉬	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	ec34b37d9d30ec99156beb1f165c1ceb4d6dc57f94f0464e5e083e17672deb04	\N	KRW	愿由щ퉬	14:08	t
10ed5442-31d0-4cb9-aab2-1c9c9c7f6223	2026-03-24	14630	?섎끂?댁쓽?꾩묠	?앸퉬	expense	MULTI Any 移대뱶	5e404ce07bc8ea16968fc81bbfa5b54d5b3501f135bb5b2eb02660dcf40a9f81	\N	KRW	?꾩떆?꾩쓬??20:52	t
1717e76e-4243-4b42-a61c-4394e2d1c83e	2026-03-24	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	faf9ec4caf2f2594ddfac012a9b097e563f3fe417e78de576385ef12e7d5acae	\N	KRW	?以묎탳??17:08	t
3d5e9837-d69d-4742-9abe-c49861873427	2026-03-24	9000	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	fc4a4a40f1cf36ecbcf30925464a03bb1d4071ce7c3a02af6c4c16b35ce6d96a	\N	KRW	而ㅽ뵾/?뚮즺	12:31	t
a6058bea-206d-4eff-9397-0069df22a201	2026-03-24	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	abb24470933cac90966410ee88df5786561f2f6efe57775adc1003d142522f8f	\N	KRW	?以묎탳??07:40	t
e81f38f4-94ca-4160-88c0-5e225668bd60	2026-03-23	3800	泥쒖궗?묒빟援??섎즺/嫄닿컯	expense	MULTI Any 移대뱶	15f0fe561765837ac6ee117c88f3217b3e57b89937286ec1f1b1fa8e9c8c728a	\N	KRW	?쎄뎅	19:31	t
0e40d73f-b346-4ccc-babf-15c169b46d74	2026-03-23	9200	?쒖슱?ㅼ쐞?몄튂怨??섎즺/嫄닿컯	expense	MULTI Any 移대뱶	5a57ea56709ab2a6fe779a71508696d87552e9b34fc5662031af0368618c5658	\N	KRW	移섍낵	19:06	t
d2c6f392-f23c-423e-af3f-9fef53eb4b91	2026-03-23	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	ea4d9c425324790db8e84373de810c0337956f657ac5d7b29c8736b9d014cf66	\N	KRW	?以묎탳??16:19	t
7d730ad0-a0de-4a08-a84c-484fe43c4e45	2026-03-23	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	a88b4d5b97b69fc1458b33adb52c55fc0971a2e002c6e7c4a5a7a95065a9db10	\N	KRW	?以묎탳??14:17	t
78d9f107-66f4-41a1-a454-685e8c2f086b	2026-03-26	10000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	3e1c5720c7f15878b2155708252eb33afff03815c496004364e32310ab69cc32	\N	KRW	誘몃텇瑜?17:09	t
0ba9fe9f-5b3d-4b37-a3ea-06e795b5351d	2026-03-30	588628	?섎굹?듭옣 ?댁껜(?꾩꽭?異쒖씠??	?異?expense	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	ec4d7b09f3b2f849354b826d6c875a266746dbde13aab2693ac8478b37a02e0a	?꾩꽭?異쒖씠??3??	KRW	?異쒖씠??04:20	t
cd1952e7-e61b-4ce4-a711-2bb7b8414f86	2026-03-26	36000	?붿뿉?ㅻえ?곗뒪???먮룞李?expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	688974737e4ab0cb6b540f44ec489e242368fc45b24146b22cfb54b5a8024627	?먯뼱而??꾪꽣	KRW	?뺣퉬/?섎━	17:27	t
1203e4a0-a690-41d9-93af-9e3a204b155d	2026-03-27	4500	而댄룷利덉빱???깅궓踰뺤썝??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	77bd94de2cf5d19b9bf4ae2ce8dc83b3f4e95ae188d43bda82b2e7c179a57756	\N	KRW	而ㅽ뵾/?뚮즺	15:35	t
18e10d9b-8624-4144-8367-1a83d1ceaf34	2026-03-28	9500	?깆떛?띿궛臾??먮ℓ???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	c17b69347a45ba1d6c23d99c0e0407e58766700a131b4c9f705c6942bc1f0554	\N	KRW	?앹옱猷?19:09	t
86e17346-58f6-462d-abad-f5feadc2ec40	2026-03-28	1	?낃툑 ?댁뿭	湲고??섏엯	income	?湲덊넻 (?댁껜)	84648d100f5fb39e1133d195a497f3df73c13a6d32487556236292433d521c20	?댁옄	KRW	誘몃텇瑜?02:36	t
460c6a27-f4db-4f2a-b327-8dae4bb169ed	2026-03-27	19200	二쇱떇?뚯궗 ?꾨??띿궛	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤?? (移대뱶)	3bd3dd100de232dad330a951a57ae2dcfd5ef3c67fff1e6ca4e45e5f0f238ad7	\N	KRW	?앹옱猷?07:16	t
a00a9132-134c-44b8-8e1e-a41fc0aa0bd9	2026-03-25	22100	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	321b5aa5f64203869b47eb60aa230639d6a8ed94728999b620fca1fb4f202c6f	\N	KRW	諛곕떖	18:46	t
72ac3f60-dc92-45de-a44d-1fb62f8b28c8	2026-03-23	6200	?ㅼ궗?묒빟援??섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	612f332d9e3c2c268380e6091ab0b1e4fce8a189c32d4d7bc117b8025b423cc0	\N	KRW	?쎄뎅	15:55	t
5d8d97af-531d-4ae0-b2ea-ea501203b75f	2026-03-27	600	?몄쇅?섏엯_KICC(李쎄뎄寃곗젣)	二쇨굅/?듭떊	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	1174976d2b1c2a0ed002a712f724d528b657db12078ec99246ce4824246c6e7e	寃곗젣\t遺遺怨듬룞紐낆쓽 ?깃린 ?좎껌鍮?KRW	?깃린猷?14:00	t
c5dd47aa-c195-4ec2-be80-d6aae542668b	2026-03-26	100000	(二??먯뒪?⑥??댁뺨?쇰땲	?뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	75b2b0b8d31682615740d9a595dc3f756c936b6736a135931cdbdc038bd794b3	?뚯궗 ?됱궗鍮?KRW	寃곗젣/異⑹쟾	08:03	t
378880a1-4063-4487-90ef-e8c195fb8b4c	2026-03-27	18000	踰뺤썝?됱젙泥?二쇨굅/?듭떊	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	650932b87e3538d4c381b046beccae48d39c20111834d2208f3e03594662aab3	遺遺怨듬룞紐낆쓽 ?깃린 ?좎껌鍮?1李?KRW	?깃린猷?14:48	t
af02242e-7c61-48a9-b9ae-4c9f8f723392	2026-03-23	257400	酉고떚?쇱슫吏?섏썝	?섎즺/嫄닿컯	expense	MULTI Any 移대뱶	dbb131a2d757392f735a54be745f38a24ff2d6bfb8a970f55eb452a1d015e2a2	援??쇰?怨?KRW	?쇰?怨?19:28	t
b0739b2b-f2ae-420d-b22d-cfde48fa739f	2026-03-25	189730	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	8bc15eeeaf8f128624b82f05d920f3d3a5a74d539104eea404341cd0e022ee4c	?곗뒿???꾧린??KRW	?꾧린??08:42	t
f9d831ae-6ded-4712-8a44-cbbebb50cbb6	2026-03-23	4000	?뚮━諛붽쾶??移댄럹?대???젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	2ed5bcacf7897ff1a47f946ec4d369ec68efcde6589ce7d6a299b6f5e1e8cfc2	\N	KRW	而ㅽ뵾/?뚮즺	08:33	t
0d53a75f-e180-4ced-84b4-b95d207f5e02	2026-03-25	1523000	?몄뿉瑜댁퐫媛뺣궓?댁뒪??二쇱떇?뚯궗	?뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	6cca15df7881538dce1bbdc29a7bb296dc8594d86cd89a871ec5670dd65e843e	?뚯궗 ?됱궗鍮?KRW	?쒖떇	19:37	t
fbab2c43-7bcf-45ff-a46b-569d06a38021	2026-03-25	43300	?⑥쑀媛뺣궓?밸━???뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	bf8ffe5d06187eafe87f96daeb8cddc68a8931b07c6b36b0748ee929fa19f199	?뚯궗 ?됱궗鍮?KRW	?몄쓽??17:58	t
5fc397be-17c0-4c4d-98b5-7b35fcfe9cda	2026-03-25	46710	SK ?명뀛由?뒪_?뺢린怨쇨툑	二쇨굅/?듭떊	expense	SK?명뀛由?뒪 X LOCA (移대뱶)	ed420cf94b3a85e07bc77614bde4707ff99403ceda817f4bf5f8f3e07212c1e2	?뺤닔湲??뚰깉鍮?KRW	媛援?媛??09:58	t
07532ea6-54cd-4e83-802f-624d36903de3	2026-03-25	50000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	812abc90203cfc8c85989fb73074d3a8066f05d9b3320a52eec7b542f8b05b16	?덈쭏???곌툑?異?KRW	?곌툑?異?05:57	t
6e3954f7-b36e-4ba7-b056-a135e38bd006	2026-03-25	219400	荑좎?(COOGEE)	?뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	b4554257d2c9ae647915339582af69dc67d9caef995b645a10c753d7df43f237	?뚯궗 ?됱궗鍮?KRW	移댄럹???17:23	t
b367353b-dde1-405d-b204-03514540274c	2026-03-23	170000	諛????댁껜	exclude	移댁뭅?ㅽ럹??癒몃땲 (?댁껜)	759d2b707760ee6712fae25d9a462963777544c8cb8d23109d589f27b00565e0	?묒＜ ?뷀?鍮??낃툑 ?댁뿭	KRW	誘몃텇瑜?14:32	t
d1d8383d-2fed-448e-9c96-5f95d41322ed	2026-03-23	170000	?낃툑 ?댁뿭	湲고??섏엯	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	d9b4f7d0f1ff90a091658157e74ea063a2b8fbb792d64d9960f324f705394ac5	?묒＜ ?뷀?鍮??낃툑	KRW	?뷀?鍮?14:33	t
97019314-d075-44a7-bb9f-55035c9a3001	2026-03-23	146100	??洹??닿퀎醫뚯씠泥?exclude	移댁뭅?ㅽ럹??癒몃땲 (?댁껜)	3d3b7998b36c87641fe010e56b2e17dbb540f3f22890482e9a5eb786cdedbc40	?쒖쫰?ㅼ뭅 ?뚰듃移대퉬 ?뺤궛 ?낃툑 ?댁뿭	KRW	誘몃텇瑜?13:52	t
7f4405b6-4f93-448a-8eb0-e1782c9f890b	2026-03-23	146100	?낃툑 ?댁뿭	湲고??섏엯	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	5da4bdbb4e32c0b89fe1579840673bfe31c97b3bf203c9b0a418555d27825150	?쒗듃?ㅼ뭅 ?뚰듃移대퉬 ?낃툑	KRW	?ы뻾鍮?13:52	t
94dccc78-edec-4d7c-8854-161757ecd2f5	2026-03-22	69000	濡?뜲諛깊솕???좎떎???⑥뀡/?쇳븨	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	5e937b2191223e0b74382725efec9e713b729dd5d08414f4ec9c18d2ca789084	\N	KRW	諛깊솕??15:48	t
4423aa29-6891-4cb6-ab7d-f6b4bf03ef90	2026-03-22	45700	?대컲(URBAN)	?⑥뀡/?쇳븨	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	39f3d3bf5ec90310aa40ac86454f363aaa2157d6a6856308e2c784c89272ad7a	\N	KRW	?⑥뀡	14:13	t
cdc6ec3d-f885-4648-b291-53031fc64fa3	2026-03-23	23850	?쒖슱?쏣TAX	二쇨굅/?듭떊	expense	SK?명뀛由?뒪 X LOCA (移대뱶)	2745c80d072aa92cae203fc3c900f387896aa4bf0928af14744a06acf569a3fd	?쒖슱???멸툑	KRW	?멸툑/怨쇳깭猷?10:57	t
b0e444e8-ec98-44fc-8e27-6c635967bde5	2026-03-23	30000	?몄쿇 媛議?紐⑥엫鍮??앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	5c5e19c7e0a2c8e722bb65bce0c7b1ced075cfc9a4ca9766940cc86d9b5ed9f3	?몄쿇 媛議?紐⑥엫鍮?KRW	紐⑥엫鍮?09:07	t
b235e8da-e269-4955-a74f-0aa7369c0bd6	2026-03-23	20000	?????紐⑥엫鍮??앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	a9c805e83612f3661c4efb5f09f1ad2ac825cae512aebcf09a4323d778c87cbe	?????紐⑥엫鍮?KRW	紐⑥엫鍮?09:07	t
aacaaa1f-1e1e-421f-a3b2-9cb4d2e47533	2026-03-23	1000000	援??⑸룉	?⑸룉	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	28f4237f25e9fad86bde952e6e367e6a6cb857fac0b132a7f9a0566eb5dfb4f5	\N	KRW	援μ슜??09:07	t
5e7f3030-492a-4a2a-b1dc-9441204d995d	2026-03-23	250000	?⑥슜???앺솢	expense	?좎뒪諭낇겕 ?듭옣 (?댁껜)	4f79367bf001e6408c457b4d309d6487688b2f01398dfc4b1518a694562d1288	\N	KRW	?⑥슜??09:07	t
3d900b37-29da-4789-9eb7-5727d0c40913	2026-03-23	250000	??IRP ?낃툑	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	c95ffad031a9336c1b3d2ccae34789614446c8ddf57b63e7587769f3c10e00b3	??IRP ?낃툑	KRW	?곌툑?異?09:07	t
9c4c33d5-8fa5-4ff9-b923-6b5b9b84590d	2026-03-23	10000	???멸?移쒖쿃 紐⑥엫鍮??앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	637be0007cd56956b18db22f2a2d869572d7ac20ba18f411d7db522c996248bd	???멸?移쒖쿃 紐⑥엫鍮?KRW	紐⑥엫鍮?09:07	t
e7240e2a-233d-40e2-bfa8-46020799ee74	2026-03-23	500000	異쒓툑 ?댁뿭	湲고?	exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	6ed72d4c45f258914c4f26d9737377472ec9d79a09f39be48ea8a7fd76dd9629	?쇱쬆 異쒓툑 ?댁뿭	KRW	誘몃텇瑜?09:07	t
8bce4ba7-6449-47c5-ad39-b55138bca36d	2026-03-23	1000000	?낃툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	7fa79d2a8a2eaf3ff2bd00596e8c3e78b53be1b95748d21b536564b5648600db	湲?t?섎굹 ?듭옣 ?댁껜 ?댁뿭	KRW	誘몃텇瑜?09:07	t
16021fe8-6d22-44fb-bfbb-ffdf9f9278b6	2026-03-23	120000	?쒖썝?명꽣?룻룿?ㅻ퉬	二쇨굅/?듭떊	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	b2a4fb0c85379c5a300c479f002231e0895bb222134f8f521310a003bbbdc52f	?쒖썝?명꽣?룻룿?ㅻ퉬	KRW	誘몃텇瑜?09:07	t
4df4ff37-c5f0-4e12-964e-f35798ced360	2026-03-23	100000	?λえ???댁옄	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	87747824812d235a699f1ee0f1010cd8c6481dfcfa2299aa4dbf8b2a811515d8	?꾩꽭 ?異??댁옄(?λえ??	KRW	?댁옄	09:07	t
f4f03a1f-eadd-4566-886d-aa416028c994	2026-03-23	158	?낃툑 ?댁뿭	湲고??섏엯	income	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	977f1d7e5504bf87cf1743a4cdc4c1b7516ab3f695b09f19673fe20a238618ec	?댁옄	KRW	誘몃텇瑜?06:53	t
57d8dea2-80d2-422b-893c-d0592b8f0e47	2026-03-23	100000	?낃툑 ?댁뿭	?異?expense	湲됱뿬 ?섎굹 ?붾났由??곴툑 (?댁껜)	ed7991af77ec3b8456da8536ae4daca5babe837eb80a7f9ce5948d8440f68a49	?섎굹 ?곴툑(10留?	KRW	?곴툑	05:20	t
ded347e4-f049-4551-a55b-c94c7f5ed441	2026-03-25	113170	?낃툑 ?댁뿭	?뚯궗移대뱶?뺤궛	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	2d24d1343c1555e7cc94812efb2b2cd50b55cb7079c65a62903f36628413585c	?뚯궗 移대뱶鍮??낃툑	KRW	?뚯궗移대뱶鍮?02:20	t
0fae310d-f1db-423c-8725-b2ab3d003945	2026-03-16	8126	?좎뒪 釉뚮옖?쒖퐯	?⑤씪?몄눥??exclude	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	8790c3c6e5781f812368a72f1cc3efc4311b89aee9e9450a5c6f605ede254b14	\N	KRW	寃곗젣/異⑹쟾	08:58	t
a74fd8d6-fd42-4dd2-bdac-0f2c58662a31	2026-03-19	11600	?좏겕濡쒕ℓ?깆빱?쇱뺨?쇰땲	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	2197a0dd21d861d4eb618c16cdf249c2bfb6f8e059136c50ed77d2ca2874522a	\N	KRW	而ㅽ뵾/?뚮즺	12:00	t
989e3378-2340-4420-a67a-19c38e8cd9f4	2026-03-19	3100	?덈큵?쎄뎅	?섎즺/嫄닿컯	expense	MULTI Any 移대뱶	ae864f101c97969d7e1319fc3c3ae412c4d7723f289771cab48a2308259f2eed	\N	KRW	?쎄뎅	09:11	t
6a7ff61d-ae7c-420c-bc7a-4e572d5de60e	2026-03-19	2900	?쇳듉?뚯븘泥?냼?꾧낵?섏썝	?섎즺/嫄닿컯	expense	MULTI Any 移대뱶	5e1a0eee843e636eacae053204537ed3c6da048d21a43276c21c0496235d6a54	\N	KRW	?뚯븘怨?09:08	t
19b82f33-fbb5-42b0-bec0-86d8754aca39	2026-03-16	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	f13de50f2bd44e1e41b3d6981f6fb60bbca051ebaf48c8e864b3c03d06c5d19a	\N	KRW	而ㅽ뵾/?뚮즺	15:57	t
1ec7cdc1-b3c2-4550-9e38-867a8f20db33	2026-03-16	4000	?고씗?꾨뱶?쒖빟援??섎즺/嫄닿컯	expense	MULTI Any 移대뱶	3a5dc4efa457ad8ac9bac2f955257da71184fd3cd6f4b57374ab23807cd4a9af	\N	KRW	?쎄뎅	15:56	t
95d9fe9d-8d51-4987-be71-ba932dae212f	2026-03-14	4480	荑좏뙜_二??⑤씪?몄눥??expense	?ㅼ씠踰??꾨?移대뱶	63bc5c1cf211f0a8c64c2b4ccd9805085446d4767b153b42d5ec4361ec4ed0a6	\N	KRW	?명꽣?룹눥??21:26	t
b4b4a8be-7802-4802-aa8b-5b5034015a9b	2026-03-21	236166	FUJISANSHIZUOKAKUUKOU  SHIZUOKA      JPN	?ы뻾/?숇컯	expense	MG+ S ?섎굹移대뱶	33d043f5e5a4f49f8416702c36a85934e19acb8e1f95d42e06de26e1eb37e599	硫댁꽭???쇳븨(?좎뀛?+怨쇱옄??	KRW	硫댁꽭??17:36	t
e4c0f7f2-6025-4e1b-b6c3-b885fc9c58bd	2026-03-23	100000	異쒓툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	98aa4bcf8d3fb7317d479d81bd6d201bd688ec4e8de6f84ae48c4415f8ca2f36	?댁껜 ?댁뿭	KRW	誘몃텇瑜?05:20	t
af4de1d3-3cc2-4281-8d05-70f0ab872389	2026-03-23	169030	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	00032cef5a75ca32eb1c23acef82d07f2768092f7e8d92bccdd0dc3fc6c6ed1b	?섏쭊 ?異??댁옄(?덈쭏??	KRW	?異쒖씠??05:06	t
2c3cac8f-640e-458f-b49f-5af754f03789	2026-03-23	299790	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	7404fdadfc57d9da698174a899696af1aaf32be38f9eee378f696aeaa23e9924	?섏쭊 ?異??댁옄(?덈쭏??	KRW	?異쒖씠??05:06	t
cc5b13eb-2068-4bd0-982b-546295d7c1c9	2026-03-22	150000	?곸쿇?ㅽ듃?뚰겕(二??쒗씎??섏씠二쇱쑀???먮룞李?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	97ddd9a9dbab1534cb5495d986bf3e9d18dedea629fe07c32630d9575a3a7121	二쇱쑀 媛??吏異?痍⑥냼	KRW	二쇱쑀	18:37	t
6571e5a7-5455-48e3-8983-449a7d897c85	2026-03-22	150000	?곸쿇?ㅽ듃?뚰겕(二??쒗씎??섏씠二쇱쑀???먮룞李?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	9f6d5f1eb859966afbe58b14142c09dbed3a9a2d5184d5a41c59312ee4d12dd0	二쇱쑀 媛??吏異?痍⑥냼	KRW	二쇱쑀	18:34	t
676ccffc-93ba-427b-9540-5f143a050588	2026-03-22	89000	?곸쿇?ㅽ듃?뚰겕(二??쒗씎??섏씠二쇱쑀???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	5941b9cc7fa36ab3f69c0a17342069b80f2d407d3ad0c7a9eb2f5c98568bb374	\N	KRW	二쇱쑀	18:37	t
2db7a3af-d82d-48b9-8959-f6920809c294	2026-03-22	70900	STORYLiNK	?⑤씪?몄눥??expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	5ea54939aba962ab1a1ebd81a41bb2590c43c08520cc32ed68f6feda5f705547	援?留덉슦??KRW	?명꽣?룹눥??16:11	t
c9124d18-2dec-4ff6-81a6-4add0048595c	2026-03-22	2289	?낃툑 ?댁뿭	湲고??섏엯	income	OK吏좏뀒?ы넻??(?댁껜)	473225bd508e65f3b875bd7a53e83761e7d9f8229c15070d9876e0730812eabd	?댁옄	KRW	誘몃텇瑜?15:38	t
259754ce-6881-47eb-8fdd-8153bffb4795	2026-03-19	16000	?⑥젣?댄봽?덉떆?⑥씠(二?	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	b624f4d41514e86396498709b0326c3bab60509258c63ff34b16749023cf04ad	\N	KRW	?앹옱猷?05:04	t
1ca60897-fc79-4971-99af-0fcb1a6b3f60	2026-03-17	20800	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	ff7b9c21958b38e9c0e74d3c07e5609b5626c18e33d3ce4230409b1e19cf5915	\N	KRW	諛곕떖	19:59	t
53bd8cd8-1ffc-4ace-ab2e-db06501ca10f	2026-03-16	23900	?ㅼ씠??移댄럹/媛꾩떇	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	4a93024dd44281b9b80d0d9054d9913ac61e3f9187354389ba242eaaedad7311	\N	KRW	而ㅽ뵾/?뚮즺	22:24	t
1d9fec83-6778-4a84-8623-e3e5ebe0fe6e	2026-03-15	3250	?꾨?諛깊솕?먯쿇?몄젏	?⑥뀡/?쇳븨	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	6c26da835d0b7d2af620c1d1908c9c1ae30fd3edd44ea8fec85c783824141734	\N	KRW	諛깊솕??10:35	t
5875a285-ed48-45d5-97e5-af6845f2b652	2026-03-21	436	?낃툑 ?댁뿭	湲고??섏엯	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	0ea3080b0a2e70a414539fc95e21b656b28058b684401f383a27159607af7c72	\N	KRW	誘몃텇瑜?03:07	t
0bbfc1c2-6eb7-429d-b011-2e72825956af	2026-03-20	6060050	?낃툑 ?댁뿭	湲됱뿬	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	a43f6dbd8b1e0cc457f5e34e3161d7c0814c316cade4376e19e98fe8618749b9	\N	KRW	?④툒??02:06	t
7f1d0d06-d5f7-4e78-af47-55d3e226119e	2026-03-20	1990	(二??곗븘?쒗삎?쒕뱾	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	ca0adcfa7a364f3d07aed4e39d41b4f15b76bd1ea5d4f315248616fad4bc3b53	諛곕? 援щ룆鍮?KRW	諛곕떖	09:30	t
910d9247-0e5a-4ab9-a9c4-f557c10b2d48	2026-03-20	69800	?쒖＜??났	?ы뻾/?숇컯	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	410181885c0290b4284eff79792cb8bd161d0491243d60ef778be0bce7bec50a	蹂듦? 鍮꾪뻾湲??ш껐??異붽?鍮?KRW	??났沅?07:52	t
c26c4dd7-e014-4b3b-a86d-c5660e223b67	2026-03-19	4	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	ae0cc259b6924567393b0ce02991959dac7a7043a2be65e9af7573a1b9586ce4	\N	KRW	誘몃텇瑜?05:43	t
0b6cd90e-220f-4b4a-a646-10bfe8ec0f6a	2026-03-19	48	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	4f25177e8a6e07621387e55210b63be6c7dad2216ec28840f62e45fade4a7e05	\N	KRW	誘몃텇瑜?05:04	t
3d14f7c5-71da-478d-b7f0-d2314147f150	2026-03-16	160000	異쒓툑 ?댁뿭	?먮?/?≪븘	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	6c6e2c861a9013488efa6fb6afdd7d56d5ad75e8f557d056940d8b10acc7e032	?대┛?댁쭛 ?쒕룞鍮?KRW	?대┛?댁쭛 ?쒕룞鍮?11:09	t
15db50ba-6fcf-4f99-a675-dbd00f47815d	2026-03-16	4400	usimstore	?ы뻾/?숇컯	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	1100b9c41fc01adb4d6e15af78f99c2bc56b971d13591cc3c3184dc23dff5dfb	?쒖쫰?ㅼ뭅 ?좎떖 援щℓ	KRW	?댁쇅寃곗젣	08:30	t
0a5e770d-433a-4817-a949-c69b573b476b	2026-03-14	0	GS25?띾궔?꾨????앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	ee36eeb016b321085fd0ceaa5572e0b4cdbd4615a61d15b4539dcc670cab935c	\N	KRW	?몄쓽??15:16	t
72287cb0-67d1-48c6-9010-76df2441e142	2026-03-16	13900	?곕㉧?덇컻?명깮??	?뚯궗移대뱶吏異?exclude	MG+ S ?섎굹移대뱶	5aceee67f78c28e7866b73ff6002e1abb82b0bb4b3d4a4217c6aa0753f4bd0ba	?뚯궗 ?앹떆鍮??좎듅??KRW	?앹떆	12:50	t
d54d5a53-02a2-4a0c-ba16-9058016a2b4b	2026-03-14	28400	荑좏뙜?댁툩	?앸퉬	expense	LOCA 365 移대뱶	261ff31ef90409bd41c86227ffce018d0ef649dbcce95429f9afb2b2230d9427	\N	KRW	諛곕떖	14:22	t
12e9028c-523b-4d80-a866-f0f0d1859261	2026-03-14	3200	?덈큵?쎄뎅	?섎즺/嫄닿컯	expense	MULTI Any 移대뱶	e7f822578c3064fd314bf3cb465f09e9bcee4f757c4636e7590427913ba2140c	\N	KRW	?쎄뎅	11:53	t
16fb9ab3-00d8-4d6d-9062-d98ff7456be0	2026-03-14	3500	?쇳듉?뚯븘泥?냼?꾧낵?섏썝	?섎즺/嫄닿컯	expense	MULTI Any 移대뱶	1256ef5fd7c6658d672b58c62305d8cefd48a8bf6d382f646e82d833c48df46a	\N	KRW	?뚯븘怨?11:46	t
28b32944-24d3-4b05-9b40-9846f41d2251	2026-03-13	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	ebace05995f22024df6cbd8d4021cc53d9250a72dfbe65b839d820712ceecf95	\N	KRW	而ㅽ뵾/?뚮즺	14:09	t
374964bd-6ded-480b-8768-419eaa30a5d6	2026-03-12	4000	(二??꾩꽦?ㅼ씠???앺솢	expense	MULTI Any 移대뱶	b9df33f0d24cbb252b3ae40ba83d6b942061a7d1963e3d68d4e4224b40a9a107	\N	KRW	?앺븘??12:45	t
7206b5d4-d15d-4529-b5e9-ef25c6e09aee	2026-03-12	8000	?낅┰臾?897?ㅻ쟻???앸퉬	expense	MULTI Any 移대뱶	66f149dd5943bd78e27372ecd5b2fc2380a53b91990185ecc1f684133406e9fa	\N	KRW	?쒖떇	12:09	t
17e908e8-117e-47ea-877c-28792d194875	2026-03-12	36900	(二??먯뒪???뚯궗移대뱶吏異?expense	MG+ S ?섎굹移대뱶	2100bd96267a8a22116b0f77648c734729f604099a9bd834fe89d640580aca18	?뚯궗 移대뱶鍮?KRW	泥좊룄	00:00	t
a8fec2b8-347c-44b1-87cd-ca8210b302b7	2026-03-11	36800	(二??먯뒪???뚯궗移대뱶吏異?expense	MG+ S ?섎굹移대뱶	5af15d646d79149886eae7de3cb0632c6a61a504bc9972a1860d01c5d113b410	?뚯궗 移대뱶鍮?KRW	泥좊룄	15:50	t
a2c14672-096b-4d1a-9511-3fc008ec3270	2026-03-13	25	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	0ebbc4a753c122a9caf96d182d2ec690b5d5a3ed2f4ffaf9f98e70f73a7194ea	\N	KRW	誘몃텇瑜?19:56	t
8ea30224-f83e-46c9-a569-8d1f0fc92113	2026-03-16	13900	二쇱떇?뚯궗 ?곕㉧???뚯궗移대뱶吏異?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	bfb6bba0ae6b0ef7cc0012082cc6556f51c284cda59cd36c85400e6ce92d8f42	?뚯궗 ?앹떆鍮??좎듅??寃곗젣 痍⑥냼	KRW	?앹떆	14:05	t
01fe3fcb-af1a-41d4-86d2-93bfd370038e	2026-03-13	8460	濡?뜲?쇳븨(二?濡?뜲?덊띁?섏썝留ㅽ깂???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	e6ab58917b3769c1743d6c24d70cab30e9ad8cb6d1049373a05f6d896d199790	\N	KRW	留덊듃	19:56	t
739bb97c-0a9c-4c25-9b97-f43ee35edf22	2026-03-12	1800	(二??먯뒪??諛섑솚?섏닔猷??뚯궗移대뱶吏異?expense	MG+ S ?섎굹移대뱶	2a884260af8b79cd0f86b0af9398304b079c73a01be645eb406939259c99b35b	\N	KRW	泥좊룄	19:03	t
01c91e9f-3aa5-4d18-a21a-5d89f9519f45	2026-03-14	30000	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	?앺솢	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	f92544950d41ea40db57a5cbfaa1086c69f573f2bb106c54b3259f83e2a3f5cf	\N	KRW	?ㅼ뼱??11:13	t
6a2de2a0-4811-4fef-b3c9-b14fc9f97b6e	2026-03-16	14200	二쇱떇?뚯궗 ?곕㉧???뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	545d21e24f484bebac6c5df4ff7a85277c0c64019972dd3725092c22fc11a7ec	?뚯궗 ?앹떆鍮?KRW	?앹떆	14:33	t
64dbda37-d590-4a4b-aa49-3b1d7f56b94e	2026-03-16	1329692	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	721d91d098624c3578207b27a75a86fb02c9b8bfc8e2ffad271614887e2c2909	濡?뜲移대뱶 ?湲?KRW	移대뱶?湲??댁껜	21:39	t
1105fd54-f683-4356-b6bb-debd4d57aa95	2026-03-16	10000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	e39432b3512981f3eb3ebac89cacd10dfd2dcf1ce020c69399556c6f0d04cfc2	\N	KRW	誘몃텇瑜?22:48	t
16c644aa-685e-4c4d-97b5-aa8618bf48f8	2026-03-15	200000	異쒓툑 ?댁뿭	寃쎌“/?좊Ъ	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	f8446b65e4639a3da2bb8e1865915c560c1050a0d4eae8e04617b979d26c31d5	?⑥븘鍮좎깮?좎슜??KRW	?⑥븘鍮좎깮?좎슜??21:23	t
c3182f52-9b3a-4a3f-ad04-62117ad6603b	2026-03-15	30000	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	23e48dfa57a168d2e699359a8ae8639caf92aab8be3f4bb7645cefc1064f2bfe	\N	KRW	誘몃텇瑜?22:36	t
bb6b4ef2-c237-4d08-b798-289be26f724e	2026-03-13	21100	援ъ씠紐??앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	18bd758f182f11243f12755bb599a37c556c1e8bad8a45ab0dda1dca41fc5447	\N	KRW	怨좉린	19:43	t
b07d7291-5bff-4987-b925-7f57b1a647da	2026-03-11	22800	留덉폆而щ━	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	f4f0b81dbb35b0f0665486fe1b8f8d1c93b38307ea35000154045aebcd8d884a	\N	KRW	?앹옱猷?20:41	t
efcf4433-f5f2-4254-b8aa-3e32160aad53	2026-03-11	8200	?몃쭏吏꾩븘?댁뒪?щ┝?띾궔??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	574d828c68b90d84ab0207b129f031a9c75203b0472fdb61ff22c387bc62bdf5	\N	KRW	?꾩씠?ㅽ겕由?鍮숈닔	20:10	t
f7955f2c-eae0-42d4-acd7-61fe4a451976	2026-03-13	6189380	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	f8fbf0563f8a8604d2ccd609be06d30255943bed1d47e8c7afa764499b9d4c6f	?섎굹移대뱶媛??댁껜?댁뿭	KRW	移대뱶?湲?08:15	t
3447c9f2-cd71-442b-ac95-7f0f6519929a	2026-03-13	291189	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	5cc6084998330f4d38c2ee42478dd4a7c07efd1112042607683cddaeed99ab96	?섎굹移대뱶媛?異쒓툑?댁뿭	KRW	移대뱶?湲?04:19	t
043c92f6-ff4a-4b60-98b2-3fe9556976ef	2026-03-13	5898191	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	2a92b092420af8bb071d6054942294e2c9e97fbf7795d0fbb94c999a60cb80b7	?섎굹移대뱶媛?異쒓툑?댁뿭	KRW	移대뱶?湲?08:20	t
9fa586ff-b89b-4c8e-82ef-62ced5be2db1	2026-03-13	1240690	?낃툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	86352c14e8da4e41b9a3835563eb6c20b71d6326a20f4b8f6268b91b79d31fee	MGS 移대뱶媛??댁뿭	KRW	移대뱶?湲?08:16	t
d63533bc-58b1-4545-a324-33b3ce6b03cb	2026-03-12	60140	SOVGlobal	?쇳븨	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	cc396586cdd51a1d9eb562014db1030abc9826a0c2c97d1eb6582ba46fba3dc9	??怨⑦봽??援щℓ	KRW	怨⑦봽??09:08	t
aed29900-7084-4c68-80a0-65268e111955	2026-03-11	22000	肄붾젅?쇱쑀??二?(?숇?援ъ뿭)	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	56aace27558d1de39d60632ad298a07429e5020e09598e557ee8da7b17d4e525	??컯??KRW	?앸퉬	16:53	t
a832f696-9aac-447c-97ec-946e23053f61	2026-03-13	63	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	3f1b4421c4ba488e4616ddc174f54f3734dca88448b0ea2c6b0114324df4279a	\N	KRW	誘몃텇瑜?19:43	t
e6565d12-1f86-4aaf-a5c6-a7df6f40b707	2026-03-11	8600	?좏럹?닿컻?명깮??0	?뚯궗移대뱶吏異?expense	MG+ S ?섎굹移대뱶	b15cde2962168d502c1972a0cb81b4ba2329cc60d3169ecb16ab76cef9302f66	?뚯궗 移대뱶鍮?KRW	?앹떆	16:49	t
980f1d5c-9bd9-4539-92a0-9aaa89317a5e	2026-03-06	2587	?좎뒪 釉뚮옖?쒖퐯	?⑤씪?몄눥??exclude	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	a8cf0b485f8275c5b3b6f853cb4e9e0027f46c7d831a14afbc1511239bd3f958	\N	KRW	寃곗젣/異⑹쟾	09:07	t
be2335d5-74a6-43ca-a701-81dbf969567d	2026-03-11	23100	KT?좎꽑?곹뭹 ?먮룞?⑸?	二쇨굅/?듭떊	expense	kt 怨좉컼??Simple Life 移대뱶	c3c3591374176019287aae1f088fc4e1232015dc61f6ad3c297012ebcdb2df1b	?곗뒿???명꽣?룸퉬	KRW	?명꽣??19:03	t
06008d33-c6df-4965-ba60-da16a9f403e3	2026-03-09	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	32d807f802db928d30d2d23364de91156a14e5a3b6c4890df27c8b5e6f97e2aa	\N	KRW	而ㅽ뵾/?뚮즺	14:11	t
c684902b-1fc9-4d79-a14a-6e1978be5cff	2026-03-09	11000	?⑹깮媛移쇨뎅???곗꽭?숇Ц?뚭????앸퉬	expense	MULTI Any 移대뱶	c89b2026f3467b1ea0af363408185397f69eb57ad0deb8ad3916c4e81674770b	\N	KRW	?쒖떇	14:07	t
2fc2bba2-4b9e-4f2d-b69f-5da304a664c1	2026-03-08	11600	?좏겕濡쒕ℓ?깆빱?쇱뺨?쇰땲	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	b315c5d9e7ae5131c21ce0d0e8b50a1b76df2be020d3d983e2313a7caa8e1aac	\N	KRW	而ㅽ뵾/?뚮즺	13:21	t
19c1bb3e-10f8-429e-8ecf-bc2413355a9c	2026-03-08	41800	?대컲(URBAN)	?⑥뀡/?쇳븨	expense	MULTI Any 移대뱶	3933f3b3656437632d84e3810892339350d1b310d35797b1e140807cf46174e0	\N	KRW	?⑥뀡	13:15	t
8cb3b5f0-df9b-416b-9059-1163acdf7289	2026-03-06	1800	(二?吏?먯뒪?ㅽ듃?띿뒪	?앺솢	expense	MULTI Any 移대뱶	f16d6c41122b5a43efc304709edc2ad941b79dd350b22550e7f800a129aad2a6	\N	KRW	?앺솢?쒕퉬??19:57	t
cdf2dda7-9076-4ee0-a511-5f8845ec1fa9	2026-03-11	52280	KT?듭떊?붽툑 ?먮룞?⑸?	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	eec631ceacf0c50404cd31370cda9167aeb3dc52e1b756e6c96e15532a257d93	援ν룿鍮?KRW	?대???14:11	t
314bf010-0da6-46ad-9023-321858203b67	2026-03-11	90420	?꾨??댁긽?붿옱蹂댄뿕(二?蹂몄젏	?먮?/?≪븘	expense	LOCA 365 移대뱶	b18a2532037c7fc327eeab0fbc2284e170e30f730360eaadbfb8e0ce7e63a3df	遊됰낫??KRW	蹂댄뿕	14:47	t
6095f088-d73b-47f7-b16e-8d7534e54067	2026-03-11	0	GS25?띾궔?꾨????앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	cdbb1a1b3b69e26e2fe552f9300cd66ecccfb1b7538fd12f1a9649a8a2f1b783	移댁뭅???ъ씤??寃곗젣	KRW	?몄쓽??20:07	t
a8095685-bc7c-4f66-a95b-baec2ba7f9f8	2026-03-11	22000	肄붾젅?쇱쑀??二?(?숇?援ъ뿭)	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	e6ce498946dc390c65627c5a1963b36993e2b3daea045b2144d1012f7180afc3	??컯???λえ??	KRW	?몄쓽??17:02	t
db51e461-3608-4130-8144-895239aafa88	2026-03-10	13900	留덉씠?ㅼ엫???⑥뀡/?쇳븨	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	71805c2f911294c80e2a2733c48e598ecb9299cd0ca3b8a77819097b2bf1f13e	\N	KRW	?⑥뀡	08:29	t
f065cf0b-354a-4a5c-a03c-eb2c70b96d37	2026-03-07	21000	遺곴꼍諛섏젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	6a38fa0897a654cf659cfac4583d0c29d230c005d9fb389cdefd9532538bee97	\N	KRW	以묒떇	17:16	t
156b8c7d-4564-431a-bcd0-09ffb6bbbb53	2026-03-07	223000	泥쒗샇 ?붿삁?쒕㉧由??앺솢	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	32badf976b7c4c924984ae81aa9c5bb4634b1e91ba135f4a7455339b1213e71d	\N	KRW	?ㅼ뼱??15:10	t
626f26de-c813-4ec0-808f-a6f0c3e32257	2026-03-07	7000	?깆떛?띿궛臾??먮ℓ???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	43174443d4b61d7e6a02ec8222d171c86aa30e8e3efbd314831b520dbb6f1521	\N	KRW	?앹옱猷?13:23	t
37c8c1db-831d-43fe-90c4-304ea819fd80	2026-03-07	10250	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	a760f28c8ca170fe7d5dffe173c00e6b14841f8b3c62de6d8942ba24d8e31a66	\N	KRW	踰좎씠而ㅻ━	11:42	t
5e174e47-f465-4f2a-a1bd-854c3b404469	2026-03-10	63740	?명띁?ㅺ났?앸ぐ	?먮?/?≪븘	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	cc07cd1df7f7954d096d7bcdb659ec3174a75a1f688de86bbd81d305a8baf58f	\N	KRW	?≪븘?⑺뭹	10:33	t
9e289639-fd14-49af-86f3-1da5eafe1698	2026-03-10	1378710	?낃툑 ?댁뿭	湲됱뿬	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	62404d5f60618d80a590fbab6af637c8f0e0ad10886a893eb69e9a818557c6f0	誘몄궗???곗감蹂댁긽	KRW	?곗감鍮?02:06	t
db386bde-cba6-4341-8fe1-e991d007c6b8	2026-03-10	2910	?낃툑 ?댁뿭	?뚯궗?섎즺鍮꾩???income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	b77ad7d9ca7bca9a0027e33033c6450b10c2ddd554a12a8a81e519a2f595bc8d	?뚯궗 ?섎즺鍮??뺤궛	KRW	誘몃텇瑜?02:06	t
35055ebd-ea85-4dfd-9cd4-da914091bbd8	2026-03-10	44820	?섎굹移대뱶	?쇳븨	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	3e1f277aa6575334c723210c52d6fc17536d59625e5709f17d23f2afd850668c	?λえ??泥?냼湲??섎━ 遺??援щℓ	KRW	移대뱶	19:02	t
ea85c4e2-921c-4e9a-868a-82ffabb7bc4a	2026-03-10	500000	?낃툑 ?댁뿭	湲고??섏엯	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	84c72f2e5d4e04482854ec5913802b018ac218c581b3777c14430cb92fb80830	?섏쭊2痢?怨꾩빟湲?KRW	?섏쭊2痢?怨꾩빟湲?15:27	t
0a169a81-af6d-4a34-a9aa-1501d63bc207	2026-03-09	500000	?낃툑 ?댁뿭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	e3d6082775ccda1c16cbb69d420c656333c7ddb33efdbefaaa2cc957d2949652	?섏쭊 1痢??붿꽭	KRW	?붿꽭	12:50	t
83d444d2-ef05-4084-917c-a5bb985c3e33	2026-03-09	57500	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	84c60b8986e3a80c3f1097ff111fbcdef5d173aa273c3b2e1a22f48d6a897e79	\N	KRW	誘몃텇瑜?09:10	t
4f15f1fe-6570-4346-acd3-7b1e9a74a7a3	2026-03-08	150000	(二??몄쭊二쇱쑀??寃쎌썝吏???먮룞李?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	23dc640a1c1a076978bfddf5b0a8bf94d2f7ca4d90521a30585880399b52f696	媛?앹＜???좉껐??痍⑥냼湲?KRW	二쇱쑀	08:21	t
78853f9e-3840-4a06-936d-3b96ecfe1ce6	2026-03-08	50000	?뚯썙怨⑦봽	臾명솕/?ш?	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	f45e78f899ef28713ad2dc2ff0ddf2d800d680e1900a4564d041739ec556bfe2	?④낏?꾩껜 ?섎━鍮?KRW	?ㅽ룷痢?12:15	t
bbaa8d27-f231-4e94-8fe7-3ce1c2454aa1	2026-03-08	64890	(二??몄쭊二쇱쑀??寃쎌썝吏???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	70843b2d7d4f6ef384d26f3dba413a92c8118f7adaca6c0077890c7c4f5399ce	\N	KRW	二쇱쑀	08:23	t
f2659091-ee74-41b7-a823-ff00ce1621dd	2026-03-08	2000	?쒓뎅寃곗젣_?몄쇅?섏엯(鍮꾩씤利?	二쇨굅/?듭떊	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	13a18b2dfa4c67398f0278ed3dbde6bf7c82ba9eda5ed5c875fc37cbeb1a8a60	\N	KRW	?멸툑/怨쇳깭猷?10:22	t
d323cf37-f864-4131-afef-d00e8c04ed93	2026-03-07	30000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	a7bd9e6d7f74f5b1c48b04cb38f4cc9f063ecf5eb879966ebd6bd1b730cf73e1	\N	KRW	誘몃텇瑜?21:56	t
dea9f080-b01e-4065-872a-b9e2523d78bc	2026-03-05	1120	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	7d211e139b9c4cb07bbb5c289481811e2b04fa7b5102ee2e717bfb4723ac1815	\N	KRW	?꾧린??08:26	t
8b918463-4905-45c4-9aa1-f772e3110124	2026-03-05	1120	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	afca5dd72d6a55ed1aad18933cea86e60922cf1d009291f10ef3944f990e5e70	\N	KRW	?꾧린??08:26	t
2ae034cb-cbdc-411e-ba72-4da02a036bc9	2026-03-05	1120	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	479c552f0839dc26bb87dfa6808c2cb78d5868d1ed72ac4286f5109c6f6c8c45	\N	KRW	?꾧린??08:26	t
20da9f13-992b-437d-b654-cfc65c20431d	2026-03-05	1120	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	b9837966fe68db89f9aa688ae47b666b3b89fee01d50cfe3a918bf627899549a	\N	KRW	?꾧린??08:26	t
90cfd190-e813-45d5-9b90-c9db9670facd	2026-03-04	4000	?⑺솕諛?移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	034a1cf058acf2f1334523df6d60e594b5654d98c86a7b32d0f2bad1e37943a5	\N	KRW	而ㅽ뵾/?뚮즺	13:07	t
1465c50c-f5fc-4999-8c8d-b654c7dba912	2026-03-04	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	7a90aab53f439dc8dffaea1959e9740b01ec2d66b4321f1b6875944b34f238c4	\N	KRW	而ㅽ뵾/?뚮즺	08:42	t
a20df1cd-85a1-453e-ad51-8e729bed0593	2026-03-04	3750	?뚮━諛붽쾶???곕??댄솕??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	11bdb83723d1317fdd51a8ec300013f5de602af1df086f1f7deceea35439df8c	\N	KRW	踰좎씠而ㅻ━	08:40	t
20fc7f12-7438-4337-95b0-f963ade9b780	2026-03-03	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	c802147fe525b49e8b89f42b95e9c4d669339b3fd9614f1c7cee80c2410571b4	\N	KRW	?以묎탳??13:52	t
f2f62b38-fca1-452a-8151-1592c061fa9a	2026-03-03	16000	?⑦룊硫댁삦	?앸퉬	expense	MULTI Any 移대뱶	7040b9948866a005dc568a67ff48804581a2509f932500e8351305f89eaad8e3	\N	KRW	?쒖떇	13:16	t
278d3f1c-d860-454b-98ef-0f103e420959	2026-03-02	6000	?섏씠?⑥뒪 異쒗눜洹??먮룞李?expense	?꾨텋 ?섏씠?⑥뒪 ?듯뻾猷??꾩슜 移대뱶II	9389f483c39d20884156d7ca476eb89e19810c45f335cf04a7a4d12b2a1b86a1	\N	KRW	?듯뻾猷?00:00	t
6ca976d4-058b-4b01-b159-b1fc37cabe13	2026-03-04	438296	NISSAN RENT A CAR      KANAGAWA      JPN	?ы뻾/?숇컯	expense	MG+ S ?섎굹移대뱶	b44d6a2272ec57e30ee1d545f9f9873e65bdd5dc8d6c549bac0c69995085941f	?쒖쫰?ㅼ뭅 ?뚰듃移?鍮꾩슜	KRW	?ы뻾	10:04	t
23667d2d-a533-46a1-b59f-27ab1678175e	2026-03-03	5	異쒓툑 ?댁뿭	湲고??섏엯	income	KB醫낇빀?듭옣-蹂댄넻?덇툑	b5c4fd77de21f4a9be9d263b25262aab4bf07d21b68086e5d7f9639d91b18858	\N	KRW	誘몃텇瑜?15:09	t
0ebbffbd-39bb-4bc7-b3d9-3e671e0881dc	2026-03-02	48550	紐⑤컮??吏?섏쿋	援먰넻	expense	LOCA 365 移대뱶	5f48b9c9c68c0c037b6851127d953fd74d7d782e4d0da19b0f05c5e71826f2bf	\N	KRW	?以묎탳??00:00	t
041140cd-acd6-4be6-9f01-0d2b0a5de69b	2026-03-02	1200	紐⑤컮??踰꾩뒪	援먰넻	expense	LOCA 365 移대뱶	45ffd8f558628f96a28e2f3e65d876303e235a75e6baac8c542dd2b61120874a	\N	KRW	?以묎탳??00:00	t
40ecfc3f-6866-437e-96bb-9bee0e02c7f5	2026-03-06	25800	荑좏뙜(二?	?⑤씪?몄눥??expense	SK?명뀛由?뒪 X LOCA (移대뱶)	34f43b402dc337b744cc3d80a24bd9581429a842be8a8d9af19fd1a613e82474	\N	KRW	?명꽣?룹눥??07:28	t
20b6da13-b632-426f-8c32-a8fa072f9a48	2026-03-04	3490	?덊뵆?ъ뒪?듭뒪?꾨젅?ㅽ뭾?⑹젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	df9a2a9790fefc8cfeef905f8d31c72b5047c1f4dfe0fe126aa5d72dbc51a94e	\N	KRW	?앹옱猷?17:31	t
af3cd7d6-de57-4110-8f93-e789272aaeeb	2026-03-04	26800	?대??섎ぐ	?⑤씪?몄눥??expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	5d2ecc4ca81d2b9a26065c6bcec06ab1092397e7d7ac66e1f0a10bb2d0a7784e	\N	KRW	?명꽣?룹눥??09:01	t
5afe4512-0be8-40c4-b495-6093ba004180	2026-03-04	22500	?ㅼ씠踰꾪럹???⑤씪?몄눥??expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	59af255057e4aec9e7e16f3c217010952a53a9be0a6ecf701e6f6921de85889a	\N	KRW	?명꽣?룹눥??09:00	t
2dc57534-ccba-4a55-956c-bf2840d58adf	2026-03-04	4900	?섏뵪紐??멸뎄???곗??댁뒪	?⑤씪?몄눥??expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	bb2224229e81d8163da24b8c554290e15ad87a67ddfb5f46a61e484b5977675e	\N	KRW	?명꽣?룹눥??08:58	t
ef95dca8-8f0c-49ed-b229-5367cdeba16a	2026-03-03	39700	?덊뵆?ъ뒪?듭뒪?꾨젅?ㅽ뭾?⑹젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	a2346ffbeb21b66136e1beda238a41694174f1fc1e8c2cbbd4f664e47315fdc0	\N	KRW	?앹옱猷?17:58	t
24051fc9-a256-4fa0-8fe6-58c701da689a	2026-03-03	3000	?덈큵?쎄뎅	?섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	3445be786e0f767350afc42edd3552b38f7795175f19d79e940082e19d043aec	\N	KRW	?쎄뎅	17:46	t
01f2643e-f251-4060-8bf0-805e44ac7b6d	2026-03-03	4900	?쇳듉?뚯븘泥?냼?꾧낵?섏썝	?섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	916b5d6816fab7a0b8689bc581b2cb2e618fab0eb64d05b2bde8368c1735ac6b	\N	KRW	?뚯븘怨?17:42	t
ae0f9005-5440-4b98-ae15-4dfa8eb0f379	2026-03-03	6000	?ㅼ궗?묒빟援??섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	8da4004c8ea5ead97c5dd602d1fe5f3238f7e52f2fbefa221d45d99c12b517a5	\N	KRW	?쎄뎅	12:34	t
441b0825-41fd-4afc-b1ab-4fadcc3eb263	2026-03-04	303380	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	d6d0024b56211cfa1496e2f8c5ae7739d7e65e6c705be6d9c149bdb40401cdc1	\N	KRW	誘몃텇瑜?12:47	t
0d9a23d7-2847-4ada-9019-07b802d334ee	2026-03-03	0	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	241d2e6a6006b6f34337f0fd305d2a7c0e529238acbd9857de669563dda9cf88	?ъ씤?멸껐??KRW	?몄쓽??22:12	t
824323fd-32f8-40f0-87b6-d2eb7478ee70	2026-03-03	5	?낃툑 ?댁뿭	湲고??섏엯	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	bc925d666ecf09c2d608f5d3990987036a704d5b3d0daa0dc650ebb232db86c8	\N	KRW	誘몃텇瑜?15:09	t
700ea5c2-7623-4514-bdc5-af92db189178	2026-03-02	5900	?좎뒪?꾨씪???⑤씪?몄눥??exclude	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	f86b07deba460259c536833309ad3f6adad889a3ecf0547a1e6b884332e23fd8	?⑥슜??寃곗젣	KRW	?쒕퉬?ㅺ뎄??11:16	t
65898229-3dcb-4093-a45b-8df362441703	2026-03-02	17	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	93d589f89f229b30bc0e0bf8d6bd2bc106cc17b06744931d71d2c13c5eaeb2e8	\N	KRW	誘몃텇瑜?11:16	t
479ee628-15c4-46d4-816d-b93a287574c7	2026-03-02	100000	?낃툑 ?댁뿭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	79424f32ab759cb8c14a988b9be961c2bfb65eeaf9d4559c0d744ee24f5fad25	?섏쭊 吏痢??붿꽭	KRW	?붿꽭	18:03	t
019ee89b-e593-4225-b694-6b970bfd85cf	2026-03-01	34997	(二??먮Ⅴ肄붿뒪 ?띿뾽?뚯궗踰뺤씤	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣 (移대뱶)	c164123e48215f7a70383d94d872e281ed303677081f24cefa1775411400ac37	\N	KRW	?앹옱猷?18:07	t
35dd4526-3cc2-42a6-839e-4297d15176b7	2026-03-01	37500	?щが?ㅼ쿇?몄젏	?앸퉬	expense	MULTI Any 移대뱶	0f088037ab267e343f929218d3c5f9bd0b83e565503a71b27e49439bdd651327	\N	KRW	?꾩떆?꾩쓬??13:18	t
982d7ee1-fd0f-4657-9727-2dba5653bef5	2026-03-01	1800	(二?吏?먯뒪?ㅽ듃?띿뒪	?앺솢	expense	MULTI Any 移대뱶	66b13607b1e9a3b74fd22f8e54df7a2dd4e48952ef05dcf65d39e141aba1640a	\N	KRW	?앺솢?쒕퉬??11:05	t
9d407b62-d208-4564-a473-1c44b08619e4	2026-03-01	36900	(二??먯뒪???뚯궗移대뱶吏異?exclude	MG+ S ?섎굹移대뱶	a8fe43163a52945199e810c11ff3a14109f22dc865a181e95b72ab3edc5a60a1	?뚯궗 移대뱶 ?덉빟 ?댁뿭	KRW	泥좊룄	09:26	t
91a1e0f9-cc3d-4c33-a051-bcaf6c6a9daa	2026-03-01	36800	(二??먯뒪???뚯궗移대뱶吏異?exclude	MG+ S ?섎굹移대뱶	6a2c13d1b67c1cec1bbf06432545da508b87555234d20c18cc45d470340a24a7	?뚯궗 移대뱶 ?덉빟 ?댁뿭	KRW	泥좊룄	09:27	t
88ad02f3-32ec-40f1-819c-d71c68e20de9	2026-03-11	36800	二쇱떇?뚯궗 ?먯뒪???뚯궗移대뱶吏異?exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	7c711b28abe06d74fe9da2d20bc21adf2d275484c43f95ae785da0ef6babc85b	?뚯궗 移대뱶鍮?以묐났 ?댁뿭	KRW	泥좊룄	15:52	t
73dc8942-11a0-499f-af86-fe56e8875680	2026-03-23	335000	異쒓툑 ?댁뿭	?ы뻾/?숇컯	expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	c992ceefca819097a216aea6e3ce4748aeab41551302f91b15c16c11dfac2605	?쒖쫰?ㅼ뭅 ?ы뻾鍮??ы썑 ?뺤궛	KRW	?ы뻾鍮꾩슜	13:50	t
4cdfcfb0-1d11-46cf-a17b-b3c514429975	2026-03-23	1000000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	7a2865e5b7e6d091932d3b68c9be856dbd4b51864916def30477d781cf5db45b	移대콉 100留?紐⑥쑝湲?KRW	?異?09:07	t
e80cd601-7edb-4826-ac49-325edfe9d2ef	2026-03-01	5800	?ㅽ?踰낆뒪肄붾━??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	950dbf5f782bee0ccde9839aa66d626bee97963dad123a1a8756b99ecd964cb9	\N	KRW	而ㅽ뵾/?뚮즺	14:18	t
8e69d783-1a9b-41f6-9841-935f79a94648	2026-03-01	2000	?ㅼ씠??媛泥쒕????앺솢	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	e20608d1d0089cd98723cfe25f844e42d8ae892fcd59e48fd62316e76eb85b70	\N	KRW	?앺븘??11:44	t
88b05454-5b51-49c9-b5e9-e013719a8992	2026-03-27	2000	踰뺤썝?됱젙泥?二쇨굅/?듭떊	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	6502ae38b6a42ce7bde73e6bae29976159c3d9616365d2318613d0117dad6878	遺遺怨듬룞紐낆쓽 ?깃린 ?좎껌鍮?KRW	?깃린猷?14:45	t
1cf11a24-85ae-4e5f-91ac-080531ab6139	2026-03-26	13700	(二??먯뒪?⑥??댁뺨?쇰땲	?뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	509c52e050cc9d50353f84a9f2fe45fb23dc56980ef6624696dcffbcc54f9a72	?뚯궗 ?됱궗鍮?KRW	寃곗젣/異⑹쟾	08:04	t
ba59b236-97f3-4ad0-8bab-5375ae0d53a3	2026-03-23	170000	??洹??닿퀎醫뚯씠泥?exclude	移댁뭅?ㅽ럹??癒몃땲 (?댁껜)	5fd0b95cd23dcc44ee97d06987b709d533220d8cc6baa8b2807684ca18a8f755	?묒＜ ?뷀?鍮??낃툑 ?댁뿭	KRW	誘몃텇瑜?14:33	t
79af3ab9-eb8b-468b-9461-3231aa33e075	2026-03-23	146100	諛????댁껜	exclude	移댁뭅?ㅽ럹??癒몃땲 (?댁껜)	c76f72920342de94abbe2350aa180d61fcfa871cb928d69a5b048a4182b94fda	?쒖쫰?ㅼ뭅 ?뚰듃移대퉬 ?뺤궛 ?낃툑 ?댁뿭	KRW	誘몃텇瑜?13:51	t
ace52b87-0699-4677-9489-a0550a2d2148	2026-03-23	198950	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	27d2e326c34fe0622f14bb14e5a73d0ba50144a7501b9740676e7bad28b789dd	?섏쭊 ?異??댁옄(?덈쭏??	KRW	?異쒖씠??05:06	t
9979893f-c590-4f1e-872d-4caf8122234c	2026-03-21	12	?낃툑 ?댁뿭	湲고??섏엯	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	9016cd396fd63f94a6deb451d224c6363687de37cd019b197cbeb6c90e3d793c	\N	KRW	誘몃텇瑜?04:02	t
b97aa2a9-11bb-4053-abe4-dc63893ac44b	2026-03-13	6189380	?낃툑 ?댁뿭	移대뱶?湲?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣 (?댁껜)	cad2ebe2138db930ceb66198dde150442002c294fd437dbc1fe58666b0a58bdc	?섎굹移대뱶媛??댁껜?댁뿭	KRW	移대뱶?湲?08:15	t
c03bd31d-b79e-48fb-b015-c890a3674703	2026-03-13	1240690	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	48449ace71c08006e8486b9387adb230c690326e19b99b5181030e0979b14047	MGS 移대뱶媛??댁뿭	KRW	移대뱶?湲?08:16	t
aa624d92-a6b5-4ca8-8502-9cd6064006fd	2026-03-10	3520	?명띁?ㅺ났?앸ぐ	?먮?/?≪븘	exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤?? (移대뱶)	dc147f4b88f854f5e1a5fee96bef16150563abe74d7213f571950bd9ce736f2e	移대뱶???좎씤?댁뿭	KRW	?≪븘?⑺뭹	10:33	t
5161c4af-263d-4808-8903-87d4cc4d02f7	2026-03-01	36900	二쇱떇?뚯궗 ?먯뒪???뚯궗移대뱶吏異?exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	36d647774db5493499139249ebc1e8133f3b7d4e0f9d21fbfc012cc806bb846a	?뚯궗 移대뱶 ?덉빟 ?댁뿭	KRW	泥좊룄	09:27	t
45525748-a3de-43cc-881e-85c70d8a32b4	2026-03-11	500000	?낃툑 ?댁뿭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	57bbd11cf7efb3fcd7906181a3ed32c0b404d461043752b029470293a7a5a21a	?섏쭊2痢??붿꽭	KRW	?붿꽭	11:37	t
ee8d0107-a059-4396-9f13-39d2619f0eb9	2026-03-08	150000	(二??몄쭊二쇱쑀??寃쎌썝吏???먮룞李?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	d01a66bbd0249d33f5f7766aef5de046a947b3559db0431d0828acb8e184258f	媛?앹＜???좉껐??痍⑥냼湲?KRW	二쇱쑀	08:23	t
937631cc-5751-4da9-a176-4767b45f9f65	2026-03-05	10000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	3e675c6fa350605c5926abb606c20c9a5598b97be6a3b59b2843e08631853b30	\N	KRW	誘몃텇瑜?07:16	t
308ec161-7886-4d8a-b819-e8079c7c2280	2026-03-01	36800	二쇱떇?뚯궗 ?먯뒪???뚯궗移대뱶吏異?exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣 (移대뱶)	d2b10997de93cad015512b65a7b400ce4559541fda5490a4744d45175b23fa50	?뚯궗 移대뱶 ?덉빟 ?댁뿭	KRW	泥좊룄	09:29	t
73406adc-b83e-42f0-969c-18d5ba957026	2026-03-01	111	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣 (?댁껜)	d34b6ba13107a9dcde48228ad567bbac1605bdf0a5f9e3b7afce4916d35761d1	\N	KRW	誘몃텇瑜?05:07	t
12cfcca3-734d-42df-96b2-a0194e7b6e2f	2026-03-01	0	GS25 ?깅궡?숈썝???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣 (移대뱶)	708d0d8a37bbced1a2e9f9e5592fea8d7fc1d1104d603e0f026efbcc2861f129	\N	KRW	?몄쓽??14:26	t
b2c4894c-ab68-490a-b360-c3000c034471	2026-02-23	220270	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	62818d1067bb31590574478474cd5d0223bc73e7ea837fbb3f4531d36e85198c	?섏쭊 ?덈쭏???異쒖씠??KRW	?異쒖씠??05:08	t
a2a1a190-f872-4d5b-888d-b2828a156c3b	2026-02-27	230000	?밸뜡?ㅼ쫰?鍮뚮씪由ъ“??二?	?ы뻾/?숇컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	3972eaf2126ac98fdecaa02d8e6ae1f0f0cd21cce34443258156658e39b0cdcf	\N	KRW	?숇컯鍮?16:01	t
f172a55c-e5a5-4821-b9a0-0dd6c7e30ce2	2026-01-02	44280	留덉폆而щ━	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	f7112a41ea90d6d24863bb3b5173055e6e660745817c2cd3ab59a3f650dfa123	\N	KRW	?앹옱猷?16:54	t
239c7777-7ae7-4f6e-bea7-2d3218189067	2026-02-23	100000	?낃툑 ?댁뿭	?異?expense	湲됱뿬 ?섎굹 ?붾났由??곴툑	7540d77a163d12361f25ef18dbe182cba817449ab2ee74d5170257cb2885e63b	?섎굹?듭옣 10留뚯쟻湲?KRW	誘몃텇瑜?09:23	t
84dd42e2-cdb1-4d3a-ab5e-5866536dedda	2026-02-23	9000	?섎굹留덊듃?≫뙆???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	0b4b7e4e69c382d135ec2bd7b3462308b3fa3a909c58b951ce1fd29b331f53b1	\N	KRW	留덊듃	19:03	t
473d0ffc-8802-4ff0-b871-aaf00428a457	2026-02-23	0	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	5fc862cc77d65666d17be432613331b0763bc2fe9e0621567c39d0f2dfa5b6d2	?ъ씤?멸껐??KRW	?몄쓽??18:49	t
d9f14da6-7c28-4883-988a-041b44bc54f6	2026-02-23	56870	諛곗뒪?⑤씪鍮덉뒪 ?섑궓?꾨꼫痢?spc?ㅽ??뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	d467104dd765b28719be3f393327b41ed1163e9abd41cf2eb9f0d30fc30abcbf	?뚯궗 移대뱶鍮?KRW	?꾩씠?ㅽ겕由?鍮숈닔	15:35	t
17980f79-9caa-465d-bade-fc31a3f4f170	2026-02-23	3900	諛곗뒪?⑤씪鍮덉뒪 ?섑궓?꾨꼫痢?spc?ㅽ??뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	e3d3bb3f587c42fce6a7b9a7ecedd57040e02a23ab6ae8c958061466de887c7e	?뚯궗 移대뱶鍮?KRW	?꾩씠?ㅽ겕由?鍮숈닔	15:36	t
38a05d53-3579-4d13-8aab-9a48b7e32ae8	2026-02-23	5600	諛곗뒪?⑤씪鍮덉뒪 ?섑궓?꾨꼫痢?spc?ㅽ??뚯궗移대뱶吏異?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	e2dbfdc5c0b24aa6ca35d0231f2f85b2f8c4b2e61e06134d78b2442c841d6570	?뚯궗 移대뱶鍮?KRW	?꾩씠?ㅽ겕由?鍮숈닔	15:39	t
44e47f01-9662-4408-bf5e-051908daf342	2026-02-23	100000	異쒓툑 ?댁뿭	?異?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	87f97c605eb764efc7f21ec696fd0019c6262da946fcbe543c54e86bff680420	10留뚯쟻湲??댁껜 ?댁뿭	KRW	誘몃텇瑜?09:23	t
8d259bef-e553-4ee2-84fa-71f17a11ea00	2026-02-23	30000	?몄쿇 媛議?紐⑥엫	?앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑	061c4709900cf837834e531edcac4664b87a091f5c69680626c04e91549c1586	?몄쿇 媛議?紐⑥엫	KRW	紐⑥엫鍮?09:08	t
35ff53d5-5c22-44fb-9b99-304187239e89	2026-02-23	20000	?????紐⑥엫	?앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑	f7777002fb754ee7dd167f9bab87ccec0d181e261857e1b5f6fbec7073360cbc	?????紐⑥엫	KRW	紐⑥엫鍮?09:08	t
c60a32e9-85e5-4df0-92c1-f1435c3ff749	2026-02-23	1000000	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	8077ef0789830fa5d1c5120d1f9c6de8aaa36214f3debd839ba103179917d357	?섎굹?듭옣 ?낃툑 ?댁뿭	KRW	誘몃텇瑜?09:08	t
ced5e6d6-b102-4508-8006-3a067eddcca3	2026-02-23	1000000	異쒓툑 ?댁뿭	?⑸룉	expense	?⑤씪?몄옄由쎌삁?곴툑	6d2c3c4ab4758340093a0576896ab69ef2b99c4a16f106f5fc8b91c0fc1e505d	援μ슜??KRW	援μ슜??09:08	t
45ea8ac3-9486-443e-9815-1e0db7a53a43	2026-02-23	250000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	4a25883d881d356bac4f215dfad5e4b77dec6199204d172a689e50dc3f2e371f	?쇱쬆 IRP	KRW	?댁쭅?곌툑	09:08	t
0b94534b-ce76-4dfb-a472-12103eb61462	2026-02-23	500000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?⑤씪?몄옄由쎌삁?곴툑	875f86d68b16c0a51add2621bb35f535fda51ec29a40b621d80510f5da4a490e	?쇱쬆 ?낃툑 ?댁뿭	KRW	誘몃텇瑜?09:08	t
30bc8676-25c3-451a-be03-82a9dee2d6c0	2026-02-23	10000	異쒓툑 ?댁뿭	?앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑	851171c6e49ada9169beaedfce140e970216ffb50e90be103ca7ae1d891f0687	???멸?移쒖쿃 紐⑥엫鍮?KRW	紐⑥엫鍮?09:08	t
92e196e1-5602-4dbf-9c28-747ce8dd60f6	2026-02-20	9450	?댁쫰?몄뒪 ?곕??숇Ц?뚭????앸퉬	expense	MULTI Any 移대뱶	9bbf0f2fac0abd9a5c55544c170cd5c8c0d10f07a007d7cd1b907238d0a34e09	\N	KRW	?⑥뒪?명뫖??18:56	t
7ae615a0-904f-4adf-baa4-3cc2a76e6cab	2026-02-19	9400	?ㅻ튃怨?4 ?꾩씠???띾궔??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	63b6b7a299855fa04a1057ae8677ab94833e4c384b02faac33a7361ab14affb0	\N	KRW	?꾩씠?ㅽ겕由?鍮숈닔	22:10	t
790d80ec-2ba0-427b-9c1f-41c849c401b4	2026-02-19	21000	媛먮?移섑궓	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	0455dd129252038da61f53159a55fd6a00dbd87c9c93ab3fc6f82e2ae293db62	\N	KRW	移섑궓	18:45	t
d5ea1d7a-ca2b-4e8b-8837-af27de6e6bde	2026-02-19	63740	?명띁?ㅺ났?앸ぐ	?먮?/?≪븘	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	7384c8a49b57f07860ed8d0f3758c0081276c8c6a826fe85be1addbf5864fa39	\N	KRW	?≪븘?⑺뭹	18:10	t
1f35f6c2-93f8-4be0-a959-126fffdccdd3	2026-02-23	331910	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	78fc79292c364102dfde9f00b556b796feca98c3b034b8a4184e2e48baad369a	?섏쭊 ?덈쭏???異쒖씠??KRW	?異쒖씠??05:08	t
e2420ebd-bce7-4727-b982-762e80686558	2026-02-23	1000000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	9e36f2bd99eebaad09adb8360875a5a9878d2159ebd6adcc96d4671d67a97412	移대콉 100留?紐⑥쑝湲?KRW	?異?09:08	t
6cff6501-0262-4480-82af-da46f34b93f2	2026-02-23	1000000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?⑤씪?몄옄由쎌삁?곴툑	2c00be8f3dff566b4003712edc2c0aebd9fb422bd39ba88d7b61ce312d4490fd	?댁껜?댁뿭	KRW	誘몃텇瑜?09:08	t
4315b82a-c1b9-451b-b5a7-8ad311164bec	2026-02-23	250000	異쒓툑 ?댁뿭	?⑸룉	exclude	?⑤씪?몄옄由쎌삁?곴툑	73f7cf4b134eb0cf0c175b0d397e3eaafe62b593acbc1dd7f7a75da9489f24fe	?⑥슜???댁껜 ?댁뿭	KRW	誘몃텇瑜?09:08	t
2b0a2bf6-6737-4b7a-b28c-3c2aaade2e13	2026-02-23	120000	異쒓툑 ?댁뿭	二쇨굅/?듭떊	expense	?⑤씪?몄옄由쎌삁?곴툑	032a648e6fee1dcb1504b70d2d719bdb7692af791f480baa807e12105793ac68	援μ씤?곕꽬?곕퉬 ?낃툑	KRW	誘몃텇瑜?09:08	t
cde4afb1-1b04-4acd-9638-d88c1ea4c7c3	2026-02-23	100000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	2a8531e76210c7a73dd17313e7147ba6c3afc14a62beb35df514d3ab29dd856f	?λえ???꾩꽭?異??댁옄	KRW	?異쒖씠??09:08	t
1bf10c29-9855-46e5-b7fa-7822261612fa	2026-02-23	115	?낃툑 ?댁뿭	湲고??섏엯	income	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	b4b32e28f743b46ab6cf51b51bd82ffee258876b31712b0232e2fb5cfc86d7fc	\N	KRW	誘몃텇瑜?06:52	t
e31369fe-0816-4e24-aec5-5b886035b180	2026-02-23	187140	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	59aa791bc1fe939ff1e87ccc4cb973b5b55a8d83da26076256888b5da3cca2c1	?섏쭊 ?덈쭏???異쒖씠??KRW	?異쒖씠??05:08	t
f2472825-61ee-4ef5-bbfe-beeb6a6ec03a	2026-02-22	2159	?낃툑 ?댁뿭	湲고??섏엯	income	OK吏좏뀒?ы넻??0fcbf2a9a0f84d7642b4e7591dd7408ad71ba7027f9b5dbf77151d6e2aafffb1	?댁옄	KRW	?댁옄	14:15	t
02daa787-71c2-4723-ab4e-58c4e4894588	2026-02-21	150000	援щ룄?쇱꽌?섎궓二쇱쑀???먮룞李?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	39acef48445d15059d32c56bb9e9d6c5b625d2a7ff92f37637c32913606e1b09	二쇱쑀 留뚮븙 ?좉껐??痍⑥냼 ?댁뿭	KRW	二쇱쑀	10:27	t
64403ab0-3147-4bd0-b36f-91ea646ccb4f	2026-02-21	78000	援щ룄?쇱꽌?섎궓二쇱쑀???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	664eb0fd3e33e4a8a72e4a802926b5ee4c8ac5e3a8ad19eefd4db57be97d8bf6	\N	KRW	二쇱쑀	10:27	t
54e1e730-e8bf-422a-b47c-79daff8573ba	2026-02-20	1990	(二??곗븘?쒗삎?쒕뱾	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	fa6c361ca60bf6bb40dca9a1c297bd186e69a729b551fe09683a28ccc6f02a83	諛곕? 援щ룆鍮?KRW	諛곕떖	09:31	t
951ab89d-78dc-4106-82d2-5166200c2455	2026-02-20	6483330	?낃툑 ?댁뿭	湲됱뿬	income	?⑤씪?몄옄由쎌삁?곴툑	0faf8005c38075be5d50f2e94659ccc8b27f8452b3b11fbfa6df1df8d7a857db	?⑥썡湲?KRW	湲됱뿬	02:05	t
7d81a1be-6cbe-4127-8bfe-296055b739e5	2026-02-20	1	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	8570a164290929e9317b7d3a3949eb33f8fca946fc2144f1f79a0987178c821a	\N	KRW	誘몃텇瑜?14:36	t
102acd65-88ff-43fa-9f72-e1fc079a3345	2026-02-20	18	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	9db30e784b995bffe849c273ec844758f01f514b2e3b263961c05ee2b7b3853b	\N	KRW	誘몃텇瑜?14:36	t
77dbf2ce-4e48-4c27-a38c-64c3d81ac849	2026-02-20	27540	?덇뎄由ъ삤???먮룞李?expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	543807a40ccdc4180172df8d0f8f724d456a5a7177dcebb10071ec6a06ba8e78	?붿쭊?ㅼ씪	KRW	?붿쭊?ㅼ씪	10:29	t
13e78382-34aa-4042-9139-bf8030248180	2026-02-20	0	CU ?댁궪?깆쟾?먮낯???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	bdbc623eb70c33d76a16d1abc2cbe5333f506a9cc6d3874cbdeea4f8d98ec574	?ъ씤?멸껐??KRW	?몄쓽??14:32	t
2d87bf03-d966-4a07-8ad3-c2400a652a77	2026-02-19	1198950	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	9c9617ea27c409d1725d93c5e95247f183f1affabf33cd74b8d7b591d7f0cfc9	濡??移대뱶?湲?KRW	誘몃텇瑜?21:39	t
da04b7c1-f900-42e2-bcec-739bdd49e256	2026-02-19	300000	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?⑤씪?몄옄由쎌삁?곴툑	f80ede5b65ab69f2ea165aced01f7d346b59da2e2525ff0df3e8ca8660d0e0b2	???ㅼ슜???μ씤?대Ⅸ) ?댁껜?댁뿭	KRW	誘몃텇瑜?17:06	t
5a987a31-cde3-4c60-a662-802f78fd3f9e	2026-02-19	300000	異쒓툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑	5bb0fb7c19228726839594c90df230035f8de7672ab5af7e940b8f292039ed96	???ㅼ슜???μ씤?대Ⅸ) ?댁껜?댁뿭	KRW	誘몃텇瑜?17:07	t
b4587868-c2a9-495e-aa7a-2e6ffe768b83	2026-02-19	300000	?낃툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?좎뒪諭낇겕 ?듭옣	1ee83b05a4603284209d764c3a8ad475bbfc772d0eb24c3acfabf6963df01812	???ㅼ슜???μ씤?대Ⅸ) ?댁껜?댁뿭	KRW	誘몃텇瑜?17:07	t
619f2ed3-3719-43a9-9ded-49c3b0511773	2026-02-19	0	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	5b8e24e0f66a95de5e6ad22fc1b2ee2196fb3a50cec931c8a3e24e3145732cdf	?ъ씤?멸껐??KRW	?몄쓽??18:53	t
e54790e6-f1d4-4126-ad19-aa387b4c9926	2026-02-19	3050	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	fa2be403cb3556402c7322a30424b62840c60ebbc55f5e79f55275e7e2cd4841	\N	KRW	踰좎씠而ㅻ━	09:44	t
221388e1-91a7-4221-881e-dad9edf944e6	2026-02-19	3800	?섎굹?쎄뎅	?섎즺/嫄닿컯	expense	MULTI Any 移대뱶	9047ff44e94dd3dcdb765607c30f783f3e9e9fec4049fd24947f1be043be41c5	\N	KRW	?쎄뎅	09:08	t
a72f06c0-5e79-4805-a0ec-f51a404c2312	2026-02-19	2900	?꾩궛?щ옉?섏썝	?섎즺/嫄닿컯	expense	MULTI Any 移대뱶	aea50a5e1f3df0f4259841ad8a297436e8a06b13169e994e68beb31f2dbc9e98	\N	KRW	?대퉬?명썑怨?09:06	t
64ac7dd9-507a-4906-9c90-5ade33eb1f5d	2026-02-18	10500	遊됰븙	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	2145d3f747a27a430425ae90ab1f0eefc178de917b228549a834e0c450029f7d	\N	KRW	?꾨꽋/?ル룄洹?14:41	t
39a0ebb5-b44d-43f9-9caa-dc901acc0e53	2026-02-18	11800	醫뗭?怨꾨? ?띾궔???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	e44fc181af40f3bb007d88136c12bac739e9e1e5a993c3b635baff4610566f21	\N	KRW	?앹옱猷?13:44	t
f7de353b-180e-46a5-87de-b8c3e3685bd9	2026-02-17	2000	?깆떛?띿궛臾쇳뙋留ㅼ옣	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	d2fed2ae24b06e4cb98e21121bd61666d42879b4e714fd7578caa93ebf330f3d	\N	KRW	?앹옱猷?17:16	t
a7810ae7-e8c5-426c-83db-47072e2a7aeb	2026-02-17	8600	?좏겕濡쒕ℓ?깆빱?쇱뺨?쇰땲	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	65b61fae55291979d1b861b845d41e1040648cb8e9ab9939adbce363e3059f79	\N	KRW	而ㅽ뵾/?뚮즺	15:52	t
59756c3e-69fb-4432-9553-f89e856adc91	2026-02-16	4500	?대뵒?쇱빱???몄쿇?쇳쁽??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	1356a0b0137502ee5c27b5e9cfacede242567708a3ca5687941bb2b2f7ed2601	\N	KRW	而ㅽ뵾/?뚮즺	16:52	t
18914033-f048-4336-bffc-8673f3aafa2b	2026-02-16	8000	KICC_ARS寃곗젣	?⑤씪?몄눥??expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	b42ad9ca66edb6434cb187e09fb5bcfc45b37bb26b4240d9979cfd9c94c6a352	\N	KRW	寃곗젣/異⑹쟾	12:48	t
9457c239-cb41-4a0e-99bd-f6089e02a376	2026-02-15	22190	湲고봽?곗뒪?	?⑤씪?몄눥??expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	6caa47e90c238ddfacb8837a9b8e6fc457898fc0749a749922b1ba80979a839a	\N	KRW	寃곗젣/異⑹쟾	20:19	t
9b72c73d-dcdc-47ff-bc45-2e15cbf067fd	2026-02-15	1550	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	4322c6fb5338a2140adf4370c050e6659d3b90c581319b734838235f9d6bdef2	\N	KRW	?以묎탳??18:45	t
a65f3c49-a6f2-4569-8a07-af2a4ae7d861	2026-02-15	5800	?ㅽ?踰낆뒪肄붾━??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	52613f269b85f6e9c92196e82115501a3e5b90e7495089cf5485f583e825eeee	\N	KRW	而ㅽ뵾/?뚮즺	15:46	t
ab754932-7e76-49f7-8e0a-ea6886fe9dcf	2026-02-15	100000	??뱀껌怨??앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	0be64bbab7f53f4e232bff0bdc014e7408bab8be68e6b049f2cce9b26c355a86	\N	KRW	?앹옱猷?15:13	t
b8c7d686-919a-4a3e-89e6-fe10e05e2646	2026-02-15	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	ab50cab5fad083daae706ef6f343968a1a774365c9a6801df256a0b6b018989a	\N	KRW	?以묎탳??12:33	t
c6cc39f6-bcb7-4fd4-9cdd-db823e58432a	2026-02-14	5000	?쒗씎?몄감???먮룞李?expense	MG+ S ?섎굹移대뱶	b1252616e5c12017e91b26a00d5eb57797fa8c52a64e63a37e8881990ed0954b	\N	KRW	?몄감	12:00	t
dadd53a2-f840-42bc-9e96-6021ff162c0a	2026-02-13	17000	(二??꾨?諛깊솕?먯떊珥뚯젏	?⑥뀡/?쇳븨	expense	MULTI Any 移대뱶	f220388bef58bb1138c740d186b4788d4966cf72aeda917377048ae95df7e951	\N	KRW	諛깊솕??19:36	t
8f631d10-b2d8-4416-ae54-2824329f400c	2026-02-13	3100	?ъ뜽?뚮젅?댁뒪 ?좎큿?곗꽭?숇Ц?뚭???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	c57b070122d2e40f072fdd4c4cc77b96088e01f6fb36c59cfdf6d69395f89a08	\N	KRW	而ㅽ뵾/?뚮즺	14:09	t
73ae5c4d-54c9-4cd5-8132-befa8d742737	2026-02-12	16500	?앺긽 ?섎뒳?붿젏	?앸퉬	expense	MULTI Any 移대뱶	acc9a39534d875a6babaf100d96601155537d8cbab9f79f4073cd5e4a6d42670	\N	KRW	?묒떇	20:59	t
f191b973-576f-482a-8c68-bef1f657c8aa	2026-02-12	16900	?몄튂?⑦뭾???숈젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	3c28ddb9cc2f4dac50636fb7801ae3cf196c2e702b00476f5c5ecb9a3274100c	\N	KRW	移섑궓	18:28	t
0a39b977-e704-4393-8781-091e081bb378	2026-02-17	2400	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	fab7f81e534613b357741c61abbd8082e72d684008d26819491aa4ac9ee169be	\N	KRW	?몄쓽??17:22	t
023ce861-ad14-4586-b8f9-0a1466b2f008	2026-02-13	744760	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	ac09250c439c61bf75d2c2665ecc37c75eda2483d934f11d538f379264b1d2a9	?섎굹移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?04:20	t
b3d9b686-2578-4476-9fc0-e05b0265fbb6	2026-02-13	3300	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	ea03cc94d8aec477f7e9a6a20879bd4db9058b780f5e5bd478998dfbb0a0b392	?쇱꽦移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?19:01	t
1539d681-3be3-4651-ac09-0c82bdb7e4a2	2026-02-13	600000	異쒓툑 ?댁뿭	寃쎌“/?좊Ъ	expense	?⑤씪?몄옄由쎌삁?곴툑	6c0ef1474b96b3c817b69a84a7fe91e98c2f709845e4f4f945ab1009063e902d	?묎? ?ㅻ궇?⑸룉	KRW	誘몃텇瑜?15:07	t
7cfbb829-11ac-4632-a40a-0e3e8025f6b1	2026-02-12	377860	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	02771e205463dbae22a10d234db3e7422f61fc144ae8a9b166f376d654d03233	?꾨?移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?21:36	t
5bfb1446-7053-4d30-9ae2-9d3c68b8f31b	2026-02-12	744760	異쒓툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑	be5fff0e10eaa15f3d1c6f941de6b11c331df9bdc60dffb7b6dde4bc258f4024	?섎굹移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?19:10	t
0dbfa08c-3516-444b-a04b-77bdcd5864e0	2026-02-12	744760	?낃툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	113b9ac005590e6b8c164d61a720ee3917ea104f110bb16be94606134e12bdd8	?섎굹移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?19:10	t
58082900-d8ca-4444-98f6-0f5c27d40098	2026-02-13	657259	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	b3deb69032d78de785f97f879abff61dbdfc9af968fd0b08816e7afa54d621f0	MGS移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?22:06	t
0ed4419c-0f5a-42f8-8505-231a9e0c1cdb	2026-02-11	23100	KT?좎꽑?곹뭹 ?먮룞?⑸?	二쇨굅/?듭떊	expense	kt 怨좉컼??Simple Life 移대뱶	cfcacf072cc98e7a33c5b6b576bd73d56d42770cedc9602295496d1dad84fd56	\N	KRW	?명꽣??19:15	t
0149a554-0fce-482e-8330-ee9cf0964ce0	2026-02-11	18800	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	807fa1717aa4c5b6bba03652e60ee5c753c8942c63fbbbc0adb6ac3ba3c20c6c	\N	KRW	諛곕떖	19:05	t
7809dfd0-c3a6-4529-9090-f4ca03089233	2026-02-11	6000	?덈큵?쎄뎅	?섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	386715b7ceecf4904a99fb928572572de883a6f269276b52550eed200acb4e0e	\N	KRW	?쎄뎅	18:10	t
241f84c4-885c-4a35-b7fd-022e97802636	2026-02-11	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	3beabc468ab81975fe2531cc3f7536c89634f5846fe1f437b455868c8f0475e9	\N	KRW	而ㅽ뵾/?뚮즺	15:02	t
0096aa60-fb31-4671-9ae0-0f4e96a51293	2026-02-11	26000	?섎끂?댁쓽?꾩묠	?앸퉬	expense	MULTI Any 移대뱶	3e1c06a0d3e6081e85c7a9c03d48b18c7acd9903ebd4f73d4a1a495dc741da63	\N	KRW	?꾩떆?꾩쓬??14:58	t
4b15dcf6-5f54-4866-a178-d0b717c85193	2026-02-11	3100	?ㅼ궗?묒빟援??섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	202e77dc8da014a6f7d9bd20afb69c1de0a0c79e42bb7b07cdd904e2f27a9911	\N	KRW	?쎄뎅	09:34	t
7e5a648d-16c9-429d-a3e3-51d988430db1	2026-02-11	43050	?뚮━諛붽쾶???곕??댄솕??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	fe6c9ee29acf031bbf1a8daf62ac5ca5f6fd4e533f138d581d0341391c9e3a0e	\N	KRW	踰좎씠而ㅻ━	08:57	t
82c453a1-586a-4cee-956f-613d7884e4a5	2026-02-11	2700	?섏＜留덊듃	?앺솢	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	14e81baa694b92eca5c746da9f50be65d24b71fc1590c4809ac0f970abdf5e52	\N	KRW	留덊듃	08:14	t
ebe8bd4c-05da-46b5-8b31-c01f1506474b	2026-02-10	23800	?앺긽 ?섎뒳?붿젏	?앸퉬	expense	MULTI Any 移대뱶	74c340f823dfaa890ad247c34361bc132aeb7601652983a48ae3b7c7addd7603	\N	KRW	?묒떇	20:17	t
4928cb54-9190-4cd5-82a5-a6ca34c45d3c	2026-02-10	23800	?앺긽 ?섎뒳?붿젏	?앸퉬	expense	MULTI Any 移대뱶	c89f7cbf7b8cb3b262cff45c17e9cdf98ff167c9337a7a0cdd0db7b4927178d5	\N	KRW	?묒떇	20:17	t
a2ebfba3-f4b8-41e2-aa14-b0c2d24c17c4	2026-02-10	4000	?⑺솕諛?移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	44dd621660c44e2cc2c373cf13cff0e01027ba8b6a5078c53cfec897b3d6dcbd	\N	KRW	而ㅽ뵾/?뚮즺	08:48	t
9cb6c680-87fc-4dad-88b1-901137ae6caf	2026-02-09	8800	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	e9ee3a18e83fbc2f890a20384998873f45bf7b252271c5681f83ac29c925efd0	\N	KRW	而ㅽ뵾/?뚮즺	08:38	t
215a2737-f30e-4c03-92b6-53141b54770d	2026-02-08	15000	二쇱감???섏씠???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	e3c253296b356404b7ec1df769ec0eaf1edbd0bb487f7f3a8864fc99f7340847	\N	KRW	二쇱감	16:55	t
7a85a32e-87f0-4631-91d3-a267046166d5	2026-02-08	39000	怨꾩젅???대떎	移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	eb67198f1a5d7d94217b21683e3b3f453b169e97d4d491565ac9a4010a16caae	\N	KRW	而ㅽ뵾/?뚮즺	16:52	t
ce7f47cf-bb2c-4a16-ad5a-688a691bc254	2026-02-08	1550	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	993a88dc7bb26557d8b3fd2cdf00c1fb7e104b1d36bcc0eae0a06a285a9787ca	\N	KRW	?以묎탳??12:49	t
29edc12a-5b18-4406-be2e-77dc8db3ecd7	2026-02-08	5200	?ㅽ?踰낆뒪肄붾━??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	e43d1b836d9eb075a614650a642c1faf9c1747e594c672a527c85240ef5a622c	\N	KRW	而ㅽ뵾/?뚮즺	10:05	t
886cf188-8a4a-4de5-be1f-97682776ec4c	2026-02-07	3500	(二??꾩꽦?ㅼ씠???앺솢	expense	MULTI Any 移대뱶	94cf764fde9dfa45ee01abe0c2fd61e2393aa43a8bfc0b0e296edbcd66763f5c	\N	KRW	?앺븘??18:51	t
c35ccf7d-7215-4194-88cd-20e8e6e43e2a	2026-02-07	2800	?ъ뜽?뚮젅?댁뒪 ?좎떎??2)	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	21bee8b6090bc7126f9469ac15f84f499210f4994f0a00a7cf387cf44cf5455c	\N	KRW	而ㅽ뵾/?뚮즺	15:13	t
38a99103-278d-4872-857e-f030ec682060	2026-02-07	3700	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	8176ac8498a40f092d95298c334578dc20cebd4a7b49a3d299a79ae7f3e2705a	\N	KRW	踰좎씠而ㅻ━	11:52	t
1eb4ab76-7429-49a0-9d1a-9e9810472aed	2026-02-11	500000	?낃툑 ?댁뿭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑	37f1bdcc4a53a49963465a81c87396c3db129e0b335b2cc6ffc85349a9e31932	?섏쭊2痢??붿꽭	KRW	誘몃텇瑜?18:22	t
c955e34d-db92-4b69-b83c-dd10fa7f6c07	2026-02-09	500000	?낃툑 ?댁뿭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑	ff52a494871149716c6e3eeca676ca6110120fd16af94162c1d22c0c78d81f4a	?섏쭊 1痢??붿꽭	KRW	誘몃텇瑜?09:49	t
59aae0ef-d2c9-4d3e-bc36-75fe2e408377	2026-02-09	677159	?낃툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	bb7a8234731934b56ebd6ef4fbe532ae9316d0532664629133272c829fe469a2	MGS移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?10:30	t
44cbf389-2933-4aea-9fbb-bfc3eb01abaa	2026-02-09	677159	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	5a7f481f82839fff7557e79c2e64fef1e593da04d18617b353fede0cdb3a1a3e	MGS移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?10:30	t
62fae9d4-2b28-4968-9ac2-9f056b7224e6	2026-02-10	300	?⑥쑀(CU) ?댄솕SK?붾젅肄ㅺ????앸퉬	expense	MULTI Any 移대뱶	3d51bd2d5b099ac466a8ac878115f00239a6f62249da1dd5807034e3e6e220f4	\N	KRW	?몄쓽??13:26	t
c2be4992-811b-43eb-82fa-74c4595b8231	2026-02-10	300	?⑥쑀(CU) ?댄솕SK?붾젅肄ㅺ????앸퉬	expense	MULTI Any 移대뱶	94a42951568a1d2b5dfd3b2d211c5ae30be2e7162d98f74f020c5fd6e047b2a9	\N	KRW	?몄쓽??13:27	t
36d352fe-e5cc-4c6a-8abc-e0adce371c86	2026-02-07	4400	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	5b3893b7c7b2b3d50011f3e07245066af12102a2b3a91499b1c7e5ee71c2d4cf	\N	KRW	留덊듃	21:14	t
0aee12e9-6740-4aa3-8314-8f1f654c8e32	2026-02-07	2400	吏?먯뒪(GS)25 ?띾궔?꾨????앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	a049c09e932b09ebe1e60a9c3df421a4f5703b29e4d154a730cf6ac9a29036e4	\N	KRW	?몄쓽??21:17	t
715f71aa-6ff9-4af3-8e9c-968ed49f4997	2026-02-07	150000	援щ룄?쇱꽌?섎궓二쇱쑀???먮룞李?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	da720e98aec7d1119b8e5d62894ece3d76bf321a026735ddbb1222a2415f1ebb	二쇱쑀 媛???좉껐??痍⑥냼 ?댁뿭	KRW	二쇱쑀	11:27	t
b79a6e10-3746-4238-bb64-8a1a2164aa44	2026-02-06	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	7d3f33f1753ef977fd0540e8278ddaf59834407f309869b6636a7de411bfce69	\N	KRW	泥좊룄	17:05	t
31da6f28-a953-4095-8e73-0018dad3cba3	2026-02-06	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	467c91cc3c91399b8d634de458a6535b911c78fa3845d2d7c8297b7e5ccdc09e	\N	KRW	?以묎탳??14:26	t
11350ac9-3730-4725-89e1-b94f17a289df	2026-02-06	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	ca72f1e783ffb32afcc841c19d0c33d829393692e44b5bd07d95bf4ec706861d	\N	KRW	而ㅽ뵾/?뚮즺	08:33	t
0564f089-1a18-4cdf-9333-d76468bcb94b	2026-02-06	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	52708915a8629ab68c3458c47e51cdeb8f95c0e09cadfe88a2f14d58e51db6db	\N	KRW	泥좊룄	07:06	t
d92c62c9-7a96-481f-aeae-ccf234944607	2026-02-05	21000	遺곴꼍諛섏젏	?앸퉬	expense	MG+ S ?섎굹移대뱶	ecab2021e1ce0724d2ccb1d6ceda56404965332b00871b4ae70f2b4df1250b42	\N	KRW	以묒떇	19:13	t
eb70c960-52b2-4b4a-a6d9-6fea507e2785	2026-02-05	6600	?몃쭏吏꾩븘?댁뒪?щ┝?띾궔??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	cf63623cef9c5bb20045c319406e93246823debfaee64bff61556c2f7a814cbe	\N	KRW	?꾩씠?ㅽ겕由?鍮숈닔	19:00	t
d656e386-1802-4c62-8476-b18300eac10d	2026-02-05	3900	諛붾굹?꾨젅???댄솕?щ???移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	75ebcba1d03ed5733053962ad198fb4707f601ec64552c1b798c1756659170d0	\N	KRW	而ㅽ뵾/?뚮즺	08:08	t
cb0d04d4-d3d6-4cb9-9c3d-9f2e9acaadb8	2026-02-05	3900	?뚮━諛붽쾶??移댄럹?대???젏	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	79c79151e8bb5bbfc171b036a005ed408b524c12aaacb16692ee37eca97fe7df	\N	KRW	而ㅽ뵾/?뚮즺	08:04	t
c7b1862a-9654-4524-ae2a-bee065bcd92b	2026-02-04	21000	媛먮?移섑궓	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	e104ba9e83fbea69960c68815ac3c1a568d8178205056e3163ad66b259ddb12b	\N	KRW	移섑궓	21:09	t
35101f34-3561-4d7f-8fb8-3f8fe9ee2579	2026-02-07	150000	援щ룄?쇱꽌?섎궓二쇱쑀???먮룞李?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	20c68731e39182e938cf003b5a865dbd25e49b28b80906e96bf0cf57609281cf	二쇱쑀 媛???좉껐??痍⑥냼 ?댁뿭	KRW	二쇱쑀	11:24	t
c0d87521-c025-4698-bb76-24ac44195ead	2026-02-07	10000	?덊뵆?ъ뒪?듭뒪?꾨젅?ㅼ꽦?⑤났?뺤젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	3e09c928c99a777a3cb43395f4b600a9818fef5a956cfe3991285c4d62f43898	\N	KRW	留덊듃	11:03	t
845cb7eb-cff3-430a-a655-c0395171cdd3	2026-02-05	15	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	1794c7724839ba2580a3aebdc8543ec6dbd81b8b9adfe95b190d09c60b00df72	\N	KRW	誘몃텇瑜?12:10	t
2a57c3a8-6c2e-4d23-b4a9-4edb02ebc613	2026-02-05	3	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	1c75958b692599d2c678c5788869a6a909e209ea3ef1d1c64db51c8d6206aadd	\N	KRW	誘몃텇瑜?13:28	t
b82c06e0-d393-4eff-91a6-b3b91538feb0	2026-02-05	50	援ш??섏씠癒쇳듃肄붾━???좏븳?뚯궗	?⑤씪?몄눥??exclude	?좎뒪 媛꾪렪寃곗젣	b675df932d24bf1f382f58b79f5ef14616a1d321c845e847d760f4468fb9453c	\N	KRW	?쒕퉬?ㅺ뎄??17:25	t
062e6ff8-acf1-475b-b859-5ee78d11e999	2026-02-05	60000	異쒓툑 ?댁뿭	?먮?/?≪븘	expense	?⑤씪?몄옄由쎌삁?곴툑	b4fdffac851d0108f29f573e98f028e563041a312e6c029958370b82d898d341	?쇱쭛 湲고?寃쎈퉬	KRW	誘몃텇瑜?17:31	t
ecc89f23-01b4-4336-b835-020008ccc9b1	2026-02-05	2400	GS25?띾궔?꾨????앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	122dbc386a3a9c5a082ca47de2887b7287d2fd9afe9afeecbd8507994cc40020	\N	KRW	?몄쓽??19:02	t
fb0ab82b-19da-4e8a-b519-9c174ee99c24	2026-02-05	500	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	ac3a292783c306b4b5765462bb4d0b0c6a7420f496920e8bd8337a3d74fa39f3	\N	KRW	誘몃텇瑜?17:59	t
db282a07-2b9a-4985-aacb-58763d72fb72	2026-02-05	21	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	b59d286b0605beefadd756ba8685e58af32a13817475310340eac22807dc34e0	\N	KRW	誘몃텇瑜?08:25	t
26d2953d-bbca-43cc-bec4-132f9926c0c0	2026-02-05	2	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	1995704b1f276f4ba959842482e8037e59dfeff1caec273780aac1648af7e7a9	\N	KRW	誘몃텇瑜?09:53	t
171021f0-78ec-4eee-8da1-197800fb4c74	2026-02-05	5280	(二??대쭏???깅궓???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	b1b5deeec35d7c4908edaa01167d0c5cc7f24e4969c349b144af06f656ad8a64	\N	KRW	留덊듃	12:10	t
987c98f6-f409-4e8d-8152-a19454ef6217	2026-02-04	300000	吏먰띁?ㅽ듃 ?щ┝?쎄났?먯젏	臾명솕/?ш?	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	62af95d59e684e89cd95698d1b8f4200e3a09033ebe97f9adba69d73f3faa69b	??怨⑦봽	KRW	?ㅽ룷痢?20:46	t
3fe2a076-4880-4bdb-8b3b-52cc411fbb4f	2026-02-04	230000	吏먰띁?ㅽ듃 ?щ┝?쎄났??臾명솕/?ш?	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	c70d75500f9b59ad8847f4cc6c1d2eec5d6d920ff9740d981fcd8b191699582d	??怨⑦봽	KRW	?대룞	20:46	t
93ac069c-07a4-4be5-9bf1-7d1ecdd766cf	2026-02-03	19900	(二??먯뒪???뚯궗移대뱶吏異?expense	MG+ S ?섎굹移대뱶	74602c7c34b58fded5b11780019a9c3e513fe947db007ba255d517d1cba5f795	?뚯궗移대뱶鍮?KRW	泥좊룄	00:00	t
07153fd8-1310-4211-a04e-fc182d021270	2026-02-04	10400	Bullsone怨듭떇紐??⑤씪?몄눥??expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	735fe52a07dda2b667f6cbf93ba275e7c485b9516cf2fe250fde70ee150903f8	\N	KRW	?명꽣?룹눥??09:53	t
a2040d4f-4a1f-4f70-b446-6778f7dfd227	2026-02-04	36380	濡?뜲移대뱶(二?	?⑥뀡/?쇳븨	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	6f66d28059300689f7a01ddf49040512c2b8888cbce7de66e0bf38ae05ec42fc	\N	KRW	諛깊솕??08:33	t
a5099c57-780e-4b68-b11b-93acc1b9519c	2026-02-04	20437	?ㅻ뒛?섏쭛	?앺솢	expense	?좎뒪 媛꾪렪寃곗젣	bff8c67f179d94ae5ba27c83c9d8b7311980546c17feb14b3a6bcaab1c8753fd	\N	KRW	媛援?媛??08:19	t
21b16a38-c516-4540-81fa-4990e39e534b	2026-02-04	10000	?낃툑 ?댁뿭	湲고??섏엯	income	?⑤씪?몄옄由쎌삁?곴툑	e591c9cc6dfbb0df24e17589720e682f79cf77c2dfe9b5e2c19d3016814d8d4e	?뚯궗?좊같 ?깆떖??鍮?鍮꾩슜	KRW	誘몃텇瑜?20:51	t
56bcc032-6f4d-4dda-9d6d-f0dea6ce1374	2026-02-05	8500	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	21c6232bb4ce2e9b224b59d9da15620b0e5b7e92e902b24f5a630eb38146fc4c	\N	KRW	誘몃텇瑜?11:56	t
3886fcb6-42f9-4920-8497-338b1bf338fd	2026-02-04	21900	?섏씠議곕쭏耳??앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	6b0915eecfa617ebdfcb077dbf6d573bc9fa12afb56729295d541e17adda3545	\N	KRW	?쒖떇	08:17	t
141a21a8-c5f5-4851-a2e1-89f355ddb5f8	2026-02-04	21000	?덉뒪24	臾명솕/?ш?	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	7b22c0cb161250f9f52d707d37e49351ff5b369511a32cb5e3953a8cdb28b26a	\N	KRW	?꾩꽌	08:11	t
2e68681a-17c9-4816-b947-d5665c07d1c7	2026-02-04	19200	二쇱떇?뚯궗 ?꾨??띿궛	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	d04e31ea2c27f5239fbcdaf8b2d2dd83baca4c963b170018a539d2000be6635e	\N	KRW	?앹옱猷?08:10	t
d8b0f9e2-4370-4c1e-b7a0-322ec800ba98	2026-02-03	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	138e6c750a7d895b2323cf894ca076f4ee1ca547ae540df72afba75ab6454fe2	\N	KRW	而ㅽ뵾/?뚮즺	13:40	t
c2966dc1-6268-411a-92e5-14296ef16ddc	2026-02-03	11000	?⑹깮媛移쇨뎅???곗꽭?숇Ц?뚭????앸퉬	expense	MULTI Any 移대뱶	4bc2cbdfa02ab57436a386c74c69c9856400f455c1ea4c9658ef818c5033d0c7	\N	KRW	?쒖떇	13:36	t
04259b10-5d07-4324-aa9c-2537185cd03e	2026-02-02	5000	?깆떛?띿궛臾??먮ℓ???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	42b5c64065e4438caedf36f5d818043db685a2bf202ff3ad24b1dc5f97c7dce3	\N	KRW	?앹옱猷?17:44	t
818ca714-a72e-4a0c-bce1-1d97faf35050	2026-02-02	19390	留덉폆而щ━	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	828f74eb1ff94a940b30873efa3829117a680c5da1107b6ba72f97975490a546	\N	KRW	?앹옱猷?14:45	t
312f4b52-f708-43ef-b6a6-a0928b64e92a	2026-02-02	4000	?⑺솕諛?移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	b1448b9ceb83d5cf7aef409862324bd5b4c8ceee0dd983b430d5c69eb070f70f	\N	KRW	而ㅽ뵾/?뚮즺	08:45	t
609807d7-9869-4b27-a903-491937758f3c	2026-02-03	30000	肄붾젅?쇱쑀??二?	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	6a4c335d579075ac615c67488b90c14d709d00413c01f14ef8cceb11b75be4cf	?깆떖??援щℓ	KRW	?몄쓽??16:21	t
9072e2c5-9a1d-40f6-976d-0b2e84bcfa1f	2026-02-02	270861	?낃툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑	cf07600af0dfefabca055b54e4a45784ac35fe6858941aae8682e031a8995067	1???섎굹 ?붿뿬 ?댁껜 ?댁뿭	KRW	誘몃텇瑜?08:21	t
62761e81-d479-46a3-b526-f93c04c928b7	2026-02-02	17	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	4c4c06d051895cc9178a0319fee3f6fc108f05a0729066c62c5b13aa61c89c08	\N	KRW	誘몃텇瑜?18:10	t
62afd68a-d949-4792-916b-0130e2c4105e	2026-02-02	5900	?좎뒪?꾨씪???⑤씪?몄눥??exclude	?좎뒪 媛꾪렪寃곗젣	3f7f273e63bb6c2dc8763b3001163fe9f290c7a9a54ed88c7c8b802d526fdc91	?⑥슜??援щ룆	KRW	?쒕퉬?ㅺ뎄??18:10	t
1f63cd8b-2cee-4634-a591-6fc56707cdca	2026-02-02	66900	?낃툑 ?댁뿭	?뚯궗移대뱶?뺤궛	income	?⑤씪?몄옄由쎌삁?곴툑	8fd6e45d6c5d932ed8ab2b80bc314ae51254003d1d83891cefbdacddbd281ae5	?뚯궗移대뱶鍮??뺤궛	KRW	誘몃텇瑜?08:22	t
6c8a9539-0713-401d-8719-c436ac3d6271	2026-02-02	66900	異쒓툑 ?댁뿭	?뚯궗移대뱶?뺤궛	exclude	?⑤씪?몄옄由쎌삁?곴툑	4067a4c604391488378bc37be7187efc27410d0b9e6853f2461c938ff31a5880	?뚯궗移대뱶鍮??뺤궛 ?댁껜 ?댁뿭	KRW	誘몃텇瑜?08:22	t
536928e6-10ee-4626-96c0-91c3f65bc22c	2026-02-02	270861	異쒓툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	6f5bf9d679bc41eb6ac16eb7c1b59c66ef103e895adb6ccb27e5a798c8289d49	1???섎굹 ?붿뿬 ?댁껜 ?댁뿭	KRW	誘몃텇瑜?08:21	t
09aaf107-2ac3-46f7-80dd-11655377212c	2026-02-02	26069	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	38554ae02b0c350a1f16a568e82e8cd229e07e34ac33d2d91adec8ff21b56bb2	\N	KRW	誘몃텇瑜?14:47	t
534327af-6832-440a-8a05-54524462fab7	2026-02-02	100000	?낃툑 ?댁뿭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑	f2a4294a8d9c72b34788c53496400274614a0ad63090e03b9c31857c3937e43c	?섏쭊 吏痢??붿꽭	KRW	誘몃텇瑜?11:44	t
80a6da79-3fe0-44d6-a6b3-1b60d8184186	2026-02-02	18100	怨좎냽踰꾩뒪 ?곕㉧???뚯궗移대뱶吏異?expense	?좎뒪 媛꾪렪寃곗젣	91bf20f44916a9b1d72234ab50bbd3f3706d6b10b279f4598f55ac2a38d67c27	?뚯궗 移대뱶鍮?KRW	?쒖쇅踰꾩뒪	10:42	t
5d3d512d-ad30-4a88-b435-425828fe87e3	2026-02-02	301861	?낃툑 ?댁뿭	誘몃텇瑜?exclude	OK吏좏뀒?ы넻??22ca2cee95ba043935a5fcdb8030c25dfd67c5c53f412f90d0581329da486bcb	吏좏뀒???듭옣 ?댁껜 ?댁뿭	KRW	誘몃텇瑜?08:24	t
91a241af-f43b-49b7-9af8-a0185847b7ba	2026-02-02	183013	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?⑤씪?몄옄由쎌삁?곴툑	ab8d283cabf9bdf8fb3010ac0dc08b7189faa40c8d8999eefee50f9561673231	?쇱쬆?붿뿬 ?댁껜 ?댁뿭	KRW	誘몃텇瑜?08:20	t
387e7582-3920-45ac-93ab-815dee0eae58	2026-02-02	19900	二쇱떇?뚯궗 ?먯뒪???뚯궗移대뱶吏異?exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	5974d6f6bf909b287f9c8ac833a1c7658241b5bae5b6d1b6924612ef70b7b966	?뚯궗移대뱶鍮?SRT ?덉빟??痍⑥냼?댁뿭)	KRW	泥좊룄	06:35	t
e02e736d-94b7-497b-962e-2680114ee432	2026-02-02	19900	(二??먯뒪???뚯궗移대뱶吏異?exclude	MG+ S ?섎굹移대뱶	31f5bafbd53563ee74d3ae96c364f033018958bd24dd42f4df69be15511126c2	?뚯궗移대뱶鍮?SRT ?덉빟??痍⑥냼?댁뿭)	KRW	泥좊룄	06:33	t
5872e04f-111a-4411-a842-14a669a6e502	2026-02-02	19900	二쇱떇?뚯궗 ?먯뒪???뚯궗移대뱶吏異?exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	fb3cb067ac6aa39d5c70d37097ad049f938fc83c5de89cbb72bf1cff47c53e72	?뚯궗移대뱶鍮?SRT ?덉빟??痍⑥냼?댁뿭)	KRW	泥좊룄	06:35	t
5975c3cb-afc8-40ab-81eb-6fb0c868cac9	2026-02-02	301861	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?⑤씪?몄옄由쎌삁?곴툑	6ac3f8e734f9dc32a970dc4a61496a8aaaaadd503f099d34fb35ebc6bbd0ab3d	吏좏뀒???댁껜?댁뿭	KRW	誘몃텇瑜?08:24	t
aae42be4-5395-4e96-9a8a-31309cef3510	2026-02-01	10795	?좎뒪?쇳븨	?⑤씪?몄눥??expense	?좎뒪 媛꾪렪寃곗젣	eea65a8615be7e219e72b97ad29beece3c6995544c388a049c6093e1ce2aa5ad	\N	KRW	?명꽣?룹눥??23:32	t
460db6d5-ad98-4478-aac1-01dcd9d0227e	2026-02-01	5000	?ㅽ?踰낆뒪肄붾━??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	4700b29acc5d73b8ebda9498b7f7e1e56d301cfc7116099adeb8d5b3b648fce6	\N	KRW	而ㅽ뵾/?뚮즺	14:35	t
4f4a13ec-3908-4d43-a655-7199fe8c0fdd	2026-04-01	602719	?섎굹?듭옣2,3???붿뿬湲??낃툑	?닿퀎醫뚯씠泥?exclude	?⑤씪?몄옄由쎌삁?곴툑 (?댁껜)	819a6816ebc2a0783eb6cbbb7cc54b081ba8d6688997686a76799c224a6aaa0b	\N	KRW	?붿뿬湲??댁껜	09:19	t
350167ef-0744-4db6-9f92-2e8d79ffaf0f	2026-02-11	53350	KT?듭떊?붽툑 ?먮룞?⑸?	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	39c92d20986ae18b8c6ba29ff51753e7ec4f40d58d91b0d1c800ed2237a99669	援ν룿鍮?KRW	?대???14:11	t
016b6144-7787-4398-9677-75a3fae8bfd7	2026-02-10	934000	?낃툑 ?댁뿭	湲됱뿬	income	?⑤씪?몄옄由쎌삁?곴툑	e7450cff384579c568817be7aae36eb8e9aeb5e397c93751efcfc23704308cdb	15???κ린洹쇱냽鍮?KRW	誘몃텇瑜?02:01	t
28560192-979c-4c73-8f55-65a9cae92b56	2026-02-01	14	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	ac486e7105f20386dbf712b679e14c7a4f8378ebaccd0e8214b77e781183d949	\N	KRW	誘몃텇瑜?04:57	t
0f029c35-bb58-40bf-8d79-18e7a7429b4c	2026-02-01	3490	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	c9f3e0f5133965cdfe724259945940247ac8a7848d0d40ea02d2fc5569ed15fb	\N	KRW	留덊듃	16:42	t
75a2d1a4-7d38-481b-8ecb-6f7682de0d48	2026-02-26	750000	異쒓툑 ?댁뿭	二쇨굅/?듭떊	expense	?⑤씪?몄옄由쎌삁?곴툑	20a202edf4de5000cb2f513aaec76462d297e889f2e0cda3ee5161612f138e1e	梨꾧텒 援щℓ 鍮꾩슜(遺遺 怨듬룞紐낆쓽)	KRW	梨꾧텒 鍮꾩슜	16:02	t
c2ffa028-5b54-41c9-a701-6a4974d20736	2026-02-25	3200	(二?吏?먯뒪?ㅽ듃?띿뒪	?앸퉬	expense	MULTI Any 移대뱶	699b0065e6e8edd69fea9f3b7c38590681e51aa215aa364a40eb1f50d8b27e11	\N	KRW	?앺솢?쒕퉬??11:27	t
e2062c03-6def-4e81-824a-0e2b717d9dd7	2026-01-02	560	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	5dd1b39fc2d733526745f5c76d383a6d105734c0b9b6df45dde02d69cbb44feb	\N	KRW	誘몃텇瑜?16:08	t
4a0f829b-af6f-4551-97f3-cb6872427798	2026-01-02	1000	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	912b38612044c18c3d3a02809028cadfb66c7f5cc9d381561c6f998e5332c7e5	\N	KRW	誘몃텇瑜?16:52	t
1f2e1e13-c767-4768-9281-5922873e6ef0	2026-01-25	10000	?뺤＜?곹쉶	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	2cac3ceb8e3f8728213d4647841b508b5009e74b5a2004d85a50624c91b8139b	\N	KRW	?꾩슱??紐?16:17	t
274a56fe-cb51-44a0-a8ef-1bb5bd5932e3	2026-01-31	25640	(二??대쭏??泥쒗샇???앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	8b399e397bc7520563e31cf3beff451e143b33b5614204c39535e3cd51c5acc8	\N	KRW	留덊듃	17:14	t
b651e68d-9e46-49d8-a864-8b35c9258cd8	2026-01-30	17500000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	645bab74531f1cb89df74f09816250a89b8d00c95c85508f9936593d50b521ec	移대콉 怨듭슜?듭옣 ?댁껜	KRW	誘몃텇瑜?19:49	t
63343804-d22f-4424-b301-e066566931ef	2026-01-30	18822910	?낃툑 ?댁뿭	湲됱뿬	income	?⑤씪?몄옄由쎌삁?곴툑	d7fa5e6a6b00a727231534ad77dc446b2fea024eb19fa08e9fa993ffaeeda1e3	PS	KRW	?깃낵湲?02:05	t
cfb07313-edf0-46b7-a539-9475758e4757	2026-01-30	34	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	a2d336214b811afbddaf3ee16e5da35634193bf55939d233a8fb1b82df7b68d4	\N	KRW	誘몃텇瑜?09:04	t
1e13c8ad-474a-4ee8-abfc-7773d3d41e5c	2026-01-30	394997	?낃툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?좎뒪諭낇겕 ?듭옣	0968b083cc231e0c05ccac0a7e308a44150835b4b45a98744074e7dd17d2b733	\N	KRW	誘몃텇瑜?09:03	t
030e4226-b4f9-4184-a81b-c1aa7c43045c	2026-01-30	19900	(二??먯뒪???뚯궗移대뱶吏異?exclude	MG+ S ?섎굹移대뱶	ccb9e72550cc4f5a761bc6e770e71a366f6a483ba9ce6ac06515493a3e6f9e4a	?섎텋?대젰	KRW	泥좊룄	13:18	t
c1f07bc7-9c45-4c56-a30b-410fe57b2684	2026-01-30	19900	二쇱떇?뚯궗 ?먯뒪???뚯궗移대뱶吏異?exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	f602940c2d9fa68b5cdaafa813a734ce93f77557827c2e4a7664cf66dd9d5918	?섎텋?대젰	KRW	泥좊룄	13:20	t
2ca0deb8-fa1d-48b6-81e2-fe417201629e	2026-01-29	12479	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	0c7c247e6410c90ff71f59bb5e0807256101efbce7fa8ce0df2107020596a714	\N	KRW	誘몃텇瑜?18:43	t
6ee6ba12-bdb9-443b-b67a-5f30a32d259a	2026-01-29	50	?곗젙?ъ뾽蹂몃?(?곗껜援?	?앺솢	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	7deb5084e21e5f0844ca3c0f19db3c148829ab98c8bdef5a92752147e986d69b	\N	KRW	?앺븘??15:52	t
23405b93-726d-4c48-9b66-4c51efc70afe	2026-01-29	20000	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	酉고떚/誘몄슜	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	03555feb86c3650532bcc8535af696adf422a248e227457d692bad9fa3948aea	\N	KRW	?ㅼ뼱??12:05	t
99252cf2-eca0-428d-9837-a3f3fcca9f37	2026-01-28	22400	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	583013f8422a50bb6c4cc4630602d769b3c6a6ec2dcb8a04e4ef0af43654d060	\N	KRW	諛곕떖	20:20	t
72418b4f-513a-44c1-ba9b-9051df2f0a92	2026-01-28	3350	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	4428257e6015a9c7eb4db3b4c586c216cc4df677f6deb58452e520f4b9725c3f	\N	KRW	誘몃텇瑜?16:47	t
b53c419b-75b8-4e3e-bf27-2839fedaefbd	2026-01-27	11000	?⑹깮媛移쇨뎅???곗꽭?숇Ц?뚭????앸퉬	expense	MULTI Any 移대뱶	9e28e5cbd98fcfb1e76cae1f677bb7b0c9b8e25ea6b7416fd9b23c10bdb904ff	\N	KRW	?쒖떇	20:02	t
48d2d966-45c7-43ec-9a2c-eb1d05485b56	2026-01-29	629223	異쒓툑 ?댁뿭	?異?expense	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	57288c49091eb4fa491f21f6470bb3f60297408370b26edd6923e7bb2ea355aa	?꾩꽭?異쒖씠??KRW	?꾩꽭?異쒖씠??04:11	t
98630263-4e46-4d36-a343-d59d7a6a43d7	2026-01-28	10000	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	酉고떚/誘몄슜	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	68cf510e02ba8b312e83f6046326938de0d8dfd8add33f8412df8930517edee3	誘몄슜???덉빟湲?KRW	?ㅼ뼱??18:10	t
39cc3683-edd5-4eed-b6c6-7670bd794e22	2026-01-28	10000	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	酉고떚/誘몄슜	exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	75dd833ab0c3a3b3e7e21788ae26331eadfd56aaaf9501fbdf126e29913c4fbd	誘몄슜???덉빟湲?以묐났?대젰)	KRW	?ㅼ뼱??18:12	t
fb67498b-9231-4ada-8a40-e4ed9eede7ab	2026-01-29	10000	?ㅼ씠踰꾪럹??酉고떚/誘몄슜	exclude	MG+ S ?섎굹移대뱶	d1413e1a82dc14828cdee2986fd85a6597d7fe522069e8df29fd283854411fe0	誘몄슜???덉빟湲?以묐났?대젰)	KRW	?명꽣?룹눥??00:00	t
5d514d51-9d6a-4505-97dc-1ea0782d2102	2026-01-27	6750	?댁쫰?몄뒪 ?곕??숇Ц?뚭????앸퉬	expense	MULTI Any 移대뱶	768319f19cccb840ac6f58e3eccf05a53a49b37ba704f1496b7a36338a3e32aa	\N	KRW	?⑥뒪?명뫖??07:59	t
d13b377a-03d0-4db5-9684-7dcfd61be578	2026-01-26	6000	(二??꾩꽦?ㅼ씠???앺솢	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	02e183457ccc4d3ef6f67eda46f61158cb8d09ea07e5f695154fa999289eb708	\N	KRW	?앺븘??14:38	t
d337c925-f0f5-4789-9079-7f33f2adbb8a	2026-01-25	12000	??뱀껌怨??앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	e34caea53a0ba8f9c41be5e8d91d4e37630400036044eb6fd3ecea8bd2b2daab	\N	KRW	?앹옱猷?16:23	t
5ca869a6-8156-4bdd-b6fd-a169ae334af8	2026-01-25	8200	醫뗭?怨꾨? ?띾궔???앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	bc4607e1c35080abbb70512d7f91a8e86aeb42fb34a1af403d909ce82f78403f	\N	KRW	?앹옱猷?16:12	t
7b695d7c-cef2-4fff-aecb-25e0e7f3be7c	2026-01-25	1550	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	2bd0ee24a95b7b53e4358f9ecae02580677422121630aa7345fa90569f089ad9	\N	KRW	泥좊룄	12:42	t
6d9257b6-ec7d-4122-8165-cb19d294024f	2026-01-25	19000	?섎굹移대뱶 二쇱떇?뚯궗	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	f8aeaea7ded6640102870945e6a73d85817511e93eb9c284454c5362cae8d169	\N	KRW	諛곕떖	09:09	t
95706ea7-d7d5-43d0-9669-6fd7c4a3ab1c	2026-01-12	500000	異쒓툑 ?댁뿭	?붿꽭	exclude	?⑤씪?몄옄由쎌삁?곴툑	84c0c70b0d168d258e2b60083aeef5784f3350511713400e512fbc4a6921c812	?섏쭊 1痢??붿꽭 ?댁껜?댁뿭	KRW	誘몃텇瑜?12:07	t
e34c290d-f771-4999-bf34-9d63bf7bfee1	2026-01-04	2	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	07541eaf0ab98af0455527c5e2859e2a677b4516ba2b983da5b5c847aa8e2d0d	\N	KRW	誘몃텇瑜?08:06	t
2ddee289-f3de-4e77-9557-4d78479058ba	2026-01-24	55300	濡?뜲臾쇱궛(二?濡?뜲?붾뱶紐곗젏	?⑥뀡/?쇳븨	expense	MULTI Any 移대뱶	62c8bf2acb415ed124dfd74fb1c5d4ff1a58691822b6d434b4aa8ff8a72baa79	\N	KRW	諛깊솕??16:27	t
1746071a-1681-44fa-91ba-3f72f3231f72	2026-01-24	2400	?덈큵?쎄뎅	?섎즺/嫄닿컯	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	4e426f65df4d0f2f4241a95f69f1b0aa619c7f5a180ce382a5a9392bf77fc3fb	\N	KRW	?쎄뎅	13:03	t
82cd3a80-82b0-4a24-9858-bbde5508de79	2026-01-24	35800	?쇳듉?뚯븘泥?냼?꾧낵?섏썝	?섎즺/嫄닿컯	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	fb0ad459792de284126097cd02cccd4b8bc9058b513cc692cf12fd84230d5754	\N	KRW	?뚯븘怨?13:02	t
13f2786c-0d8e-4cb8-b535-647ebbdae283	2026-01-23	17800	濡?뜲?쇳븨(二?濡?뜲?덊띁?섏썝留ㅽ깂???앺솢	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	009058764078d4fa3389fcaccef614f3eca6094757dbe755649489ac78062ac9	\N	KRW	留덊듃	17:56	t
3e08fac7-7f3a-4755-b5ba-5adc90b42506	2026-01-23	3200	?섎굹?쎄뎅	?섎즺/嫄닿컯	expense	MULTI Any 移대뱶	e3ed6635aabd1d6408dc19a085af2413a6b294b44f66e721f2ff6545f09ac555	\N	KRW	?쎄뎅	15:11	t
b8d78c17-35fb-4503-bc33-ade0a91a19fc	2026-01-23	2900	?꾩궛?щ옉?섏썝	?섎즺/嫄닿컯	expense	MULTI Any 移대뱶	074a3b8616fee193a8e4599fa7dd1a02f4ae7b6433801e7b3d2fb36f114e9c23	\N	KRW	?대퉬?명썑怨?15:10	t
524c5540-8c01-4f92-bce6-c7afab8c62c7	2026-01-23	4100	?⑥쑀?좊룞?쇱꽦???앺솢	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	2bf7b28c059d29cc3fe8c662b68ad5eb82c45db873633cca1903d9b50e88dd1e	\N	KRW	?몄쓽??15:10	t
3d7c4d89-96ea-477a-85e5-3f9ec1ce81e0	2026-01-23	3000	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	62e31e53df1eff0e85521f9f91916850ec3b9f7ac585260357830863329fdbce	\N	KRW	而ㅽ뵾/?뚮즺	08:52	t
c2699de7-a439-49b8-bcfe-7fecef3932c4	2026-01-26	46710	SK ?명뀛由?뒪_KICC	?앺솢	expense	SK?명뀛由?뒪 X LOCA	2a6943f1dcea0d43ebca0b502fb589bc024e9d590283cc4917e7d77719ead44c		KRW	媛援?媛??11:13	t
3275632b-10d1-4bd6-89dc-1b2685f1901a	2026-01-26	217220	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	d7cc275f7be2e4e401274720714c998222721edd40819046ac37c4f2a4ba10aa	?곗뒿???꾧린??KRW	?꾧린??08:42	t
b7b5e560-28ba-418c-8701-125f3f5eea31	2026-01-26	50000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	fea6ac07c1905446ab50a26326ae430bc2585127fb72d9842405e31e38b4e7d7	?덈쭏???곌툑?異?KRW	?곌툑?異?06:14	t
cfd666d2-7e67-41a3-8bbc-84e96b9b5b1b	2026-01-25	2800	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	OK吏좏뀒?ы넻??3420d3af42f8f22a266196932baf402a1fba646003374fe1b3eb13104b403d7d	\N	KRW	誘몃텇瑜?16:16	t
94665d34-b896-4969-8f67-1cb924c69d4f	2026-01-23	13980	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	MULTI Any 移대뱶	c89c02fb6e3489dfe3b501602ab34e4fffc6d455f977fa1ba4394e1f8cf6b52e	\N	KRW	留덊듃	15:28	t
f0f5ae2d-7cf9-4753-850e-4adf3b96d2c7	2026-01-23	50000	異쒓툑 ?댁뿭	寃쎌“/?좊Ъ	expense	OK吏좏뀒?ы넻??909cf17481e1a5f10f372874c2bbb50b927bb6d47703c6b1d705bf5e1ddac996	?꾩쭊???꾨줈 寃고샎(?쇱꽦 ?섏썝)	KRW	異뺤쓽湲?16:28	t
5b417b42-7c2e-4b25-a434-df0b5d34a2c8	2026-01-23	12	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	df2379b3c5be8a485a251189ef78854c804ad4d0f8253546e241aff95ab5176a	\N	KRW	誘몃텇瑜?15:10	t
d7b45310-d594-42a0-9136-af21a5a82204	2026-01-23	22660	?쒖슱?쏣TAX	二쇨굅/?듭떊	expense	SK?명뀛由?뒪 X LOCA	dea6670c993d6b1682fef3b4397146a3e78c19296ae4c683273403a9786b1674	?쒖슱 ?멸툑	KRW	?멸툑/怨쇳깭猷?10:54	t
4c55741c-bb8b-49cb-b54c-61c4b4ccd5b3	2026-01-23	53	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	ecce0d75326d8452dde3cbdd8948892edbacd0265f254bd86e8d5ab544405d1f	\N	KRW	誘몃텇瑜?17:56	t
68201df4-2f8f-4206-8ab2-5ca5f31fd224	2026-01-22	7400	?먯씠移섎뵒???꾩씠?뚰겕紐?二쇱떇?뚯궗	?⑥뀡/?쇳븨	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	71bc0f99a03529396cd28b0dcea8b3acd55a7a9e2aeadda45d23ceab50184c59	\N	KRW	?꾩슱??紐?13:20	t
e4270acc-5f19-4449-bea8-16a2d5c8e754	2026-01-22	62070	?명띁?ㅺ났?앸ぐ	?먮?/?≪븘	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	3a2e3aa04c5f19766a12138a843ac0a3aa6ed98aa5158e4d0944ee1e8712cbd4	\N	KRW	?≪븘?⑺뭹	12:26	t
73f18c8d-7b5e-414b-a36b-180257b26f5f	2026-01-22	4000	?⑺솕諛?移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	1c268345ffedb52b66473461644d4213db95adefc52eebba404d4b13ac978288	\N	KRW	而ㅽ뵾/?뚮즺	12:01	t
2c6fb5b1-376c-43a6-97c8-733659ac2d10	2026-01-22	12900	?먯씠移섎뵒???꾩씠?뚰겕紐?二쇱떇?뚯궗	?⑥뀡/?쇳븨	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	72642a37ddb202f243a96022e667eb99ea17f55edb3a2128329cda8e11fba03c	\N	KRW	?꾩슱??紐?11:37	t
0ca102b6-2379-4f34-b3c2-dfa53e626dc1	2026-01-21	15500	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	390d8da4df5d1279063a706e7b92f4db0d7df28806547c39b84991066035aedc	\N	KRW	諛곕떖	13:31	t
6db8f5b3-8c2b-4760-91f4-18e0dc7a1572	2026-01-23	1000000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	88e8fada04b847e87b1c70a678f5625fcb355061be12441140d03e842e09a5c6	移대콉 100留뚮え?쇨린	KRW	誘몃텇瑜?08:19	t
ec71f5b6-1b1f-48ef-9475-3f20f5b77a2d	2026-01-23	66900	?낃툑 ?댁뿭	?뚯궗移대뱶?뺤궛	income	?⑤씪?몄옄由쎌삁?곴툑	1bb19668cb89f32abe0df2f753ef93092db8f795b092b5f94d8543a8c56b1226	?뚯궗 移대뱶鍮??뺤궛	KRW	誘몃텇瑜?02:20	t
797ff6ef-403c-4966-ad42-a6820a3c94b8	2026-01-22	16000	泥쒗샇?ㅽ겕由곌낏??臾명솕/?ш?	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	810942c74b017de519ff443a11c5920c6c33646dcde0ae29203a6a99226786ac	\N	KRW	?ㅽ룷痢?17:04	t
fed1ef63-f55c-409a-ba33-7ff1a3c6524a	2026-01-22	48	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	5270e7811f07243c4862943b8259c02fe9e674f221c52caeed8875062f62f17c	\N	KRW	誘몃텇瑜?17:04	t
a0e633fe-87af-49a4-8e19-1b70b2640efe	2026-01-22	100000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	876e517d825c165f7dd605013d06edaea4027a091c795c45d834447a894a4a0c	\N	KRW	誘몃텇瑜?13:39	t
08352a41-f0c7-4499-ae36-7eab36b040a2	2026-01-22	9	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	c805892b8d94b593424138a2be9f052787aa411c8a615a50e80e0f2fbe53d24c	\N	KRW	誘몃텇瑜?13:20	t
07061c31-5358-4ff0-aa30-33fd7aa16d44	2026-01-22	22	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	2d5878d490b61bcc7948a283f42d390d79fa1a24361b6d0f92271f35ae8b9662	\N	KRW	誘몃텇瑜?13:20	t
eefea030-6691-493f-889a-4129f5deae74	2026-01-22	100000	?낃툑 ?댁뿭	?異?expense	湲됱뿬 ?섎굹 ?붾났由??곴툑	e5ca186b73f17d60aa0a318411721ce059281ef77c48d8d7b924a375c94a839c	?섎굹 ?듭옣 10留??異?KRW	誘몃텇瑜?04:22	t
d5094872-5a3e-4dd2-a3ab-93ac385345f1	2026-01-22	7	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	52a4f9ad05578897bdfe404e44378d1abcf5a287c91768581a3d7852ed7d3974	\N	KRW	誘몃텇瑜?07:46	t
d51ac271-d266-49ed-b52b-19792db4e4a7	2026-01-22	3380	?명띁?ㅺ났?앸ぐ	?먮?/?≪븘	exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤??	22c32755f9f83b6973e5db4728d70df5453c8b2d1b02a03e2ae1329d1d15861b	移대뱶???좎씤 ?댁뿭	KRW	?≪븘?⑺뭹	12:26	t
118873cf-5c7f-42ca-b02d-0b62c06f41fa	2026-01-22	38	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	afc25300bea2e320b39b946e5b7c970ef42f1f5189b398f95b6a30bc09f7e3bb	\N	KRW	誘몃텇瑜?11:37	t
5cf5894b-79fb-451c-bb56-274c48489c93	2026-01-21	500000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?⑤씪?몄옄由쎌삁?곴툑	e89794805bb1126815c4f194ac0d167a86eca7d37f0c85d00cdea6c0f032ae62	?쇱쬆 ?댁껜?댁뿭	KRW	誘몃텇瑜?08:20	t
eca4013d-ff3f-4e74-8f17-46c6aa0cbb31	2026-01-21	10000	異쒓툑 ?댁뿭	?앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑	746f0dead261ba540b0170054424ad160ed6f6439855f2c3117ae533b77edcf5	???멸?移쒖쿃 紐⑥엫鍮?KRW	紐⑥엫鍮?08:20	t
f9879a19-fe2d-4d10-bfdd-0bd995562958	2026-01-21	250000	?낃툑 ?댁뿭	?⑸룉	exclude	?좎뒪諭낇겕 ?듭옣	3ee0979c5511c3d1b47ba1d6f38f9f58b9b71b066ae52b64e3023d07f3d86432	?⑥슜???댁껜?댁뿭	KRW	?⑥슜??08:20	t
55073624-ce2a-4153-82de-4322f2a4d6b4	2026-01-21	1000000	異쒓툑 ?댁뿭	?⑸룉	expense	?⑤씪?몄옄由쎌삁?곴툑	3288e2d6e2470ca491ead388f0963bfbebded3ac5c6154284691be630d45fef5	援μ슜??KRW	援μ슜??08:20	t
da7fd292-8177-4e9d-98f1-a45650673b52	2026-01-21	20000	異쒓툑 ?댁뿭	?앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑	c74078a34cb773e811b3678d2ff584b2955266b0803bc47ada2996f9e050271a	?????紐⑥엫鍮?KRW	紐⑥엫鍮?08:20	t
216e8033-0a82-4faa-a76d-60692145b7e3	2026-01-21	30000	異쒓툑 ?댁뿭	?앺솢	expense	?⑤씪?몄옄由쎌삁?곴툑	4326c63c0d95a05deb59fb56823d3988ddc402f4b8492bbd2efca5e9c716d609	?몄쿇 媛議?紐⑥엫鍮?KRW	紐⑥엫鍮?08:20	t
d5ed9639-563f-4e16-8809-cd6eba5307ae	2026-01-21	2000	怨듦났湲곌?_KPN	二쇨굅/?듭떊	expense	MULTI Any 移대뱶	27caf8e79e9239616c36de1da558364a8fb1574f3e5ef74626a2e7a341a91685	\N	KRW	移대뱶	16:44	t
1e774171-5749-479b-a3c3-c290e530513d	2026-01-21	250000	異쒓툑 ?댁뿭	?⑸룉	expense	?⑤씪?몄옄由쎌삁?곴툑	32288551c7f2071190baa875bd53b5363b9d7c63d230836ea90c9afa2a7352d5	?⑥슜??KRW	?⑥슜??08:20	t
426f33b4-acf5-468e-b07d-abc68297161e	2026-01-20	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	ada272e0642f459f1e3527da7517d23f6a2405686e570b53591f4045ac8b7b6d	\N	KRW	而ㅽ뵾/?뚮즺	08:45	t
2c433e17-754d-4e51-9919-3a4a87b756d6	2026-01-18	13600	釉붾（蹂댄?而ㅽ뵾肄붾━???좏븳?뚯궗	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	98c50fd3dd1a75b82a553aebf34207b44c02917a5ff1285eb06f70ba7a9f9fdb	\N	KRW	而ㅽ뵾/?뚮즺	12:38	t
673cc484-7057-41a6-af87-83e4fbca8e69	2026-01-18	10000	?깃컯?ㅽ겕由곌낏??臾명솕/?ш?	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	5fbd7d5152a382ec81f52272904eeece2b73f5128c9f10a882ea468a33475522	\N	KRW	?ㅽ룷痢?12:04	t
c3cddd88-a411-47c6-9123-7e64c4eeb4e6	2026-01-17	42000	濡?뜲臾쇱궛(二?濡?뜲?붾뱶紐곗젏	?⑥뀡/?쇳븨	expense	MULTI Any 移대뱶	96daa40f590b915b4d6110cbf69fb239aedb194de7b62e60a805bccb7849de31	\N	KRW	諛깊솕??21:02	t
422b3f74-68c6-448a-82a1-b24004b343f9	2026-01-17	5000	?쒗씎?몄감???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	1e39d54a67795e56ce809a5b5965c4004e6d4e202de9a0f66e84d6acbc439791	\N	KRW	?몄감	13:06	t
7715a388-867a-4ca9-98c7-e54dbbbc8406	2026-01-17	81000	?곸쿇?ㅽ듃?뚰겕(二??쒗씎??섏씠二쇱쑀???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	57bec237d052e65a3425024979b6883bc7e0f962ac1c8f3745180a107bcfe168	\N	KRW	二쇱쑀	13:03	t
f4fa0463-1c36-47fb-8db4-e10017e53fee	2026-01-17	20000	援щ룄?쇱꽌?섎궓二쇱쑀???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	fa8fe7d2ad947787f4fddf00c3e29b8ee0074f2b0dfc9ce7547225a73cd0da67	\N	KRW	二쇱쑀	10:21	t
4ce32d76-3e71-4281-8de7-e42ec367c6a2	2026-01-21	331910	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	b4cdda28a7178cfba3a634c871c44e6b4d0d1671c88780e0cba2147ecaf11e90	?섏쭊 ?덈쭏???異??댁옄	KRW	?異쒖씠??05:05	t
5cabc57b-191e-4e01-bdb9-df0113a19f4d	2026-01-21	6433140	?낃툑 ?댁뿭	湲됱뿬	income	?⑤씪?몄옄由쎌삁?곴툑	0d784b30b5f34c2836c426ebeb7b3ef1da74c5f47cf4b25e4944dc6aeee88c83	?⑥썡湲?KRW	誘몃텇瑜?02:05	t
2ae26139-988a-4e20-98cd-179711a253ae	2026-01-21	220270	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	f8e9688226c35a6298615f4d36714432a4fbffc89e71cdaa41c1492510c8909f	?섏쭊 ?덈쭏???異??댁옄	KRW	?異쒖씠??05:05	t
58aa85b4-e56b-4b82-bbae-f39b2529d18c	2026-01-21	1000000	?낃툑 ?댁뿭	?닿퀎醫뚯씠泥?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	ed402cc310c9c63ced3ea8969ecfd08247393aa1641429aeaa43eb1e0cb45b3d	?섎굹?듭옣 ?댁껜?댁뿭	KRW	誘몃텇瑜?08:20	t
efbc50ee-5a18-4721-99bc-0a9c40026f2c	2026-01-21	1000000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?⑤씪?몄옄由쎌삁?곴툑	22d1d82f5909ca784f9c7c95ef8ea541b51cdd2398d749435095fc8cbd213fa1	?섎굹?듭옣 ?댁껜?댁뿭	KRW	誘몃텇瑜?08:20	t
3045eaa7-8fc5-4f42-ab50-63ef48d8140c	2026-01-21	250000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	7c25054fdf50ee2942ee241dcac0fb22b274284ee72366d837d87640b2b88092	?쇱쬆 IRP ?댁쭅?곌툑	KRW	?곌툑	08:20	t
ca059796-e036-4b78-9d6f-ac27756e1d17	2026-01-21	120000	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	7ea7c7c06cd2d1f802f3557a81af918eef41870853aa1b3cfd606aa2d7496852	?λえ???꾩꽭?異??댁옄	KRW	?異쒖씠??08:20	t
f9d95608-2cb3-41c5-bc15-16677b705069	2026-01-20	1990	(二??곗븘?쒗삎?쒕뱾	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	bd6d10d932a3e5927e18cce45fa93f9e1141e6e1345f82c06bbc32ae56f23077	諛곕? 援щ룆鍮?KRW	諛곕떖	09:32	t
cc55b18f-076a-45e3-b0b8-89a824dc3852	2026-01-20	18600	?섎굹移대뱶	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	809dd44004fd3336c1c9528d89adaec3eb045f74c0413071be6b51c368b608e0	荑좏뙜?댁툩 ?ㅼ슫??곕꼫	KRW	移대뱶	18:56	t
df1de300-3b43-4fff-a59c-85f82fddfa87	2026-01-20	10000	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	酉고떚/誘몄슜	exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	2120dd2626c8cd11fe68b997d0dc5b740e4bf6fda610dd31b4b01682521fdc05	?덉빟湲?痍⑥냼?대젰	KRW	?ㅼ뼱??12:33	t
0eed1e85-24e8-4a72-b410-04a2d86189f1	2026-01-20	10000	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	酉고떚/誘몄슜	exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	6d6aeab2b99917f8767cbcc522ef887925dc4cb015a61b6c9534226b3b074be7	?덉빟湲?痍⑥냼?대젰	KRW	?ㅼ뼱??12:32	t
593c7baf-de30-4613-b3c7-079bde9bc4b4	2026-01-19	2100	GS25?띾궔由щ쾭鍮뚯젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	19daefe793926782c6d770ae9c8f6542490458b0620f5cb4cef4f00335e25780	\N	KRW	?몄쓽??19:18	t
afa16de3-479a-412d-86a5-88aac9c1e685	2026-01-17	150000	?곸쿇?ㅽ듃?뚰겕(二??쒗씎??섏씠二쇱쑀???먮룞李?exclude	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	f85ec18e9a28f9ec2b9e2317f65bd489ed2c6af57f944e8bb07ebb101cc744d4	媛???ъ쟾 寃곗젣 痍⑥냼 ?댁뿭	KRW	二쇱쑀	13:00	t
9578872a-7eeb-4e02-bf2b-0c2c27fc827b	2026-01-19	84	?낃툑 ?댁뿭	湲고??섏엯	income	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	a071b13d81c863d442435b141dc4372f685da04ecf2a9aa2aaf916b7fc949ff4	?댁옄	KRW	誘몃텇瑜?06:48	t
5934b801-8590-4ec6-8299-fc6f96f5d9cb	2026-01-18	34820	?섎굹移대뱶	?쇳븨	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	c2d6204f0c2903066f6bccf236a3e8ccda5310c762bd1a007aaa204acdd4e805	移섏빟援щℓ(?쇱냼?ㅼ씤)	KRW	移대뱶	22:46	t
1a89ba80-9245-4567-b810-b7acef1ad094	2026-01-18	3259	?낃툑 ?댁뿭	湲고??섏엯	income	OK吏좏뀒?ы넻??7a4d2dd9ab294750630cac113eb644c85fe6aadc3e465670d24622bae5b5d363	?댁옄	KRW	誘몃텇瑜?14:05	t
37f8387b-6744-4e0c-8c7a-6020c1b68e06	2026-01-17	2500	?덊뵆?ъ뒪?듭뒪?꾨젅?ㅼ꽦?⑤났?뺤젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	e158aa8a8792fa2d97eaf0955587281ae5c53559f3fcf0ffa016d17fb900da40	\N	KRW	留덊듃	10:04	t
3ac85514-f80a-4ad1-a3fb-0d1c2c0389d1	2026-01-16	18793	?섎굹移대뱶	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	e00780735d9e438ab27ab97872bc1d92e94eb8de904117b6c864606295bab3d6	荑좏뙜?댁툩 怨좎텛移섑궓	KRW	移대뱶	19:50	t
9558ac34-3468-4928-a762-9d4d4059aba2	2026-01-16	27270	(二??곗뵪?붿뺨?쇰땲媛뺣궓濡쒕뜲?ㅼ젏	移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	0e04e89d43bd7b7e880e0ec03c92e884c4a5ca49c37e18be3e290a32468d523e	\N	KRW	而ㅽ뵾/?뚮즺	15:06	t
27884f7e-799f-4ba8-af4b-a5239456a060	2026-01-16	9000	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	8576d6587cb322cfb94d65d3e56c89fa70ed6732dda3bf66154915a6215d83e7	\N	KRW	而ㅽ뵾/?뚮즺	13:44	t
f72469d3-7c87-475d-8eb4-134672c247e0	2026-01-14	30900	媛??移댄럹/媛꾩떇	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣(?ъ씤??	cc08a42ac36f0d8b107efcfc8c42644fd2800867335556eeb6061708367049ee	\N	KRW	而ㅽ뵾/?뚮즺	20:00	t
717e8a90-a5bf-4da3-807b-e3f21f103ca3	2026-01-14	29000	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	df45f5ac416015312ab1585ab2b855590b7a90f557205faadbb5e0b1dfc5962a	\N	KRW	諛곕떖	19:48	t
564d9be9-0c40-469c-8a74-8af741b83a57	2026-01-14	25900	?ㅼ씠??移댄럹/媛꾩떇	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	dc849027237818f0d9657c87c942cdcef182c8a9ee9c017574325193de51f206	\N	KRW	而ㅽ뵾/?뚮즺	10:06	t
add09d7e-2b64-407a-952d-0f6c5ceb8474	2026-01-14	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	00e2046886d5d6358a44f6af81bb1b5cdb1bc6754b4d042c9ef9984b860145b2	\N	KRW	而ㅽ뵾/?뚮즺	08:42	t
b48dab9a-4a2f-4d03-bb8d-1b82cb9a097c	2026-01-13	7200	?몃쭏吏꾩븘?댁뒪?щ┝?띾궔??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	8eb7fcba213d92c21699646e1cba2edf93d16fae358a224c6b48350c75dd3f5b	\N	KRW	?꾩씠?ㅽ겕由?鍮숈닔	20:16	t
3b89914f-5191-421e-9c57-b617213d3b7e	2026-01-12	20900	KT?좎꽑?곹뭹 ?먮룞?⑸?	二쇨굅/?듭떊	expense	kt 怨좉컼??Simple Life 移대뱶	ce61d63ef5690b95478c860021eebefaa2f1a8dc6d44edfab72a88ca99a24ec1	\N	KRW	?명꽣??19:16	t
62102ee5-04e3-44b5-98e8-87ea9849fcd4	2026-01-12	21600	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	253861a1ab776c08feeab4dee896723ab68ddad629c6616878d3bdf9f994ffdf	\N	KRW	踰좎씠而ㅻ━	18:36	t
f23caa65-9e49-42ee-a8d2-8878f8371ad2	2026-01-15	47260	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	15639a43d7307d4be61bac2b85cf8e5f453b1d809e589bf5c732c734d1dd6b85	\N	KRW	留덊듃	18:29	t
f8c98b86-c115-440c-b9b3-22e93e8c3f2b	2026-01-15	90420	?꾨??댁긽?붿옱蹂댄뿕(二?蹂몄젏	?먮?/?≪븘	expense	LOCA 365 移대뱶	6c16d8f4a60ec10e57e1f176ef976f95e9aff5ccc1df4e8971fd2ae6cb264e2c	遊됰낫??KRW	蹂댄뿕	12:21	t
b86fe1cf-a56e-4b72-9e2d-80c93d02e588	2026-01-14	964103	異쒓툑 ?댁뿭	移대뱶?湲?exclude	OK吏좏뀒?ы넻??95b740f191f8de4cbc2060a45f29b42e6c42591f015ae5997063626e968cebf8	濡??移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?09:36	t
c177d9e4-768e-448e-9011-0458d52651d9	2026-01-14	964103	?낃툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	dcbf677664d0d915639b1fc3ee10c551d11fce1470676652e1e453400e78f5e8	濡??移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?09:36	t
201ac6b1-e081-4adb-b9a3-4dcbbbedf874	2026-01-14	964103	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	c46a3dd112ebd4604ff7bb672b79883f4e7a5d9dfccf18b91b0f95ab38159e99	濡??移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?21:36	t
0ea28775-535b-44c7-87e5-b155d63469b1	2026-01-14	70000	?꾨━吏??섑듃?덉뒪	臾명솕/?ш?	expense	SK?명뀛由?뒪 X LOCA	4f4bb492b1ff320b1f86563cc19a0667282d9900cdf184a741142a7675f970cf	\N	KRW	?대룞	00:00	t
996c4299-d8e8-4c9f-bc2a-8449cf94d96c	2026-01-14	10000	?щ갇?ㅼ뼱 泥쒗샇蹂몄젏	酉고떚/誘몄슜	exclude	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	06f4df23af63ce8098017c7a35bd43d2b8943b6e07452e5e33844055283cb3cc	?덉빟?댁뿭(痍⑥냼?대젰)	KRW	?ㅼ뼱??12:43	t
de17987e-aa28-4b0a-b82a-340aad885521	2026-01-13	817140	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	a0be30dbbc3919158ece88185d3d1832fbd44163b56419ab3ea2709db03e8d81	MGS 移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?22:09	t
676898c2-1fc9-40dd-a8c5-7a36e069e6ca	2026-01-13	817140	?낃툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	74455408bedd35f1cbb256691ea168607d83df2d1ee4516aa89e68cc004712f0	MGS 移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?13:01	t
3fa6dba5-e787-452b-9c62-c5efe39e153e	2026-01-13	11660	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	242f204c83b0f9464e6e6ab5c7acb4a70ce28a31712d5aa92cac954a024fe60c	\N	KRW	留덊듃	20:08	t
809a48db-97df-4e0b-b0d7-b3b725ab55d9	2026-01-13	1600	怨듦났湲곌?_KPN	二쇨굅/?듭떊	expense	MULTI Any 移대뱶	dac1e4584fc90511cdf6d73bf3750c70c2b48d66811cbaa1755b6a51432681cb	\N	KRW	移대뱶	16:29	t
da266876-2639-49a1-891b-7264c242bb21	2026-01-13	13200	(二?移댁뭅??硫쒕줎)_?대땲?쒖뒪	臾명솕/?ш?	exclude	MG+ S ?섎굹移대뱶	57b2e944e23c302e1136b01eb47d0656bee77d308127bf2fa67b863aab4bad05	硫쒕줎 ?뱀씤痍⑥냼	KRW	?뚯븙	15:43	t
498c9462-86a3-4948-97a1-0b304c2c2ebe	2026-01-13	13200	(二?移댁뭅??硫쒕줎)_?대땲?쒖뒪	臾명솕/?ш?	exclude	MG+ S ?섎굹移대뱶	ba8642ed750d0a2925c78c75482a881acff3166bfaa014407fa3a0b349f828af	硫쒕줎 ?뱀씤痍⑥냼	KRW	?뚯븙	15:29	t
444d5dc4-11e2-42bc-9e82-cbdadd18e2ca	2026-01-13	977514	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	d270b542d7a3d41c7a0e89fa90b83a00181305b840c12d7753566b7d5ae42b1b	?섎굹移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?13:09	t
65a1dca1-c30b-4278-803d-cc43b98eaf40	2026-01-13	977514	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	OK吏좏뀒?ы넻??660727a86da2b8be29386e17e9ceb5c196aac28dada1845e449f4ecad59a4f34	?섎굹移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?13:01	t
7b64d266-42de-40e6-9d71-bd8a2acc564a	2026-01-13	977514	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?ㅼ씠踰꾪럹??癒몃땲 ?섎굹 ?듭옣	8635b9c39675ef1a21bb070ebad23fe8dce68ee6b5885b0c3b271ad993de93e2	?섎굹移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?13:01	t
830be08d-c669-4638-876d-567da01562d2	2026-01-12	326070	異쒓툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	7b6aba1707c5d0f74333463b27afc6a849a42dd32753136b23068abd856a5c89	?꾨?移대뱶?湲?KRW	誘몃텇瑜?21:36	t
256f835a-46df-4474-8ec6-19fc01038dbe	2026-01-11	18500	?띿뾽?뚯궗踰뺤씤(二??쒖뒪	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	fa0b96267bec45a4b138c9dc613ca4078a1aabd52397f687338d753493ef2ff8	\N	KRW	?앹옱猷?14:38	t
43ffb439-2647-4249-8bb5-987199c9520c	2026-01-11	2000	?띿뾽?뚯궗踰뺤씤(二??쒖뒪	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	e53da9c002e4090a9231560e3c8f7a51081786c82e8be1aafbcad75e6e77dfba	\N	KRW	?앹옱猷?14:36	t
debb40f7-1902-4e66-8b76-63751e6fb572	2026-01-11	48000	?띿뾽?뚯궗踰뺤씤(二??쒖뒪	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	b785e54fdd7004b9174cafaf3396a701c652da56883218dccee89e60c5fb58d4	\N	KRW	?앹옱猷?14:29	t
3ac0a4a0-f8ba-4581-953a-c4baba9f2d14	2026-01-10	5000	吏?덉빟援??섎즺/嫄닿컯	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	c38842576eba7069192fe3c4bc4e7da3db76e16e58675c8531904b5baf0db929	\N	KRW	?쎄뎅	19:26	t
e9e9836d-aad1-451c-bbdf-84ada94c47b5	2026-01-10	5000	二쇱떇?뚯궗 寃뚯엫?뚮윭?ㅼ뼱裕ㅼ쫰癒쇳듃	臾명솕/?ш?	expense	MULTI Any 移대뱶	59b72164368f4f9f202c91bb680460adcd0ca34d3f3b8baa4e13a74ee2f5ec63	\N	KRW	寃뚯엫	17:09	t
8710ff54-609d-48d5-a745-468e903957a6	2026-01-10	16700	?ㅽ?踰낆뒪肄붾━??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	c24acc09276b8fc4a92d7799e3e02d215c5606e4293968dd8c247cd3a11227cd	\N	KRW	而ㅽ뵾/?뚮즺	14:08	t
3da5e5e0-a0bb-4dce-9464-0890f0bfa164	2026-01-10	38040	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	29d5df18b45a087fb776f363d05b7de8926818a4854386831dd2e1ca11ec2def	\N	KRW	諛곕떖	11:47	t
89308192-7ca6-46a5-a81a-b32f96af77c6	2026-01-10	19200	二쇱떇?뚯궗 ?꾨??띿궛	?앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	ba30fe96d78fe5f981b4a616630c497e9e2e0bead5cec2896fa44fffc8eb25ef	\N	KRW	?앹옱猷?07:50	t
75cab64d-7acf-4946-9dc7-0fd5ab93f227	2026-01-08	19950	?덊뵆?ъ뒪?듭뒪?꾨젅?ㅽ뭾?⑹젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	1c60aabacabe18d97b466da18e997e50fa2883819077f63efd70b2fdd5b2df6c	\N	KRW	?앹옱猷?18:54	t
44109732-e416-44df-96aa-ad4873196ac2	2026-01-08	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	32ce324ec41230766f6a383f12c7e96c63bba7c942d5be4b5f57a35c2028b0b0	\N	KRW	而ㅽ뵾/?뚮즺	08:32	t
e93200be-a959-4e66-8f91-e9e038066875	2026-01-08	3750	?뚮━諛붽쾶???곕??댄솕??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	39adb47a4202af4c8efcc75a7860971a5c29ce2e77153625fdc4073cc8211672	\N	KRW	踰좎씠而ㅻ━	08:30	t
3c42b8cf-0c54-4eae-a505-7e244bd4d635	2026-01-12	500000	?낃툑 ?댁뿭	?붿꽭	exclude	OK吏좏뀒?ы넻??86c467b146775a57cfdd31cb08d2ea3a50e7dffc9915941ec39ded52eb5ec6dd	?섏쭊 1痢??붿꽭 ?댁껜?댁뿭	KRW	誘몃텇瑜?12:08	t
de19a7a9-10b6-4bbd-9ac0-159168a9105b	2026-01-12	326070	?낃툑 ?댁뿭	移대뱶?湲?exclude	?⑤씪?몄옄由쎌삁?곴툑	9546a681178dff837e66a76209d5820ac9ac0ee073462e987b4e4859e22a5468	?꾨?移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?09:32	t
9070c19c-a441-45f3-81b8-a625ef05a595	2026-01-12	326070	異쒓툑 ?댁뿭	移대뱶?湲?exclude	OK吏좏뀒?ы넻??65209a5fd8462518866c574d373c4751b870e1f15af5a29e399ab8b5952c5499	?꾨?移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?09:32	t
723cbf28-8689-49e7-9d1f-dcae1031f888	2026-01-12	220000	異쒓툑 ?댁뿭	臾명솕/?ш?	expense	OK吏좏뀒?ы넻??ca181993dd214955449dc9ce52981210ad570fc13a23e56a3406429ed5d521c7	?ㅼ쫰?밸뜡 ?뺤궛	KRW	誘몃텇瑜?09:01	t
45ef4e76-b848-46ee-b82c-c37bd164a396	2026-01-11	2100	吏?먯뒪(GS)25 ?띾궔?꾨????앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	f75605cca222c61deae4ff59055f1f1a14584413d1652e406df524546b1eb73f	\N	KRW	?몄쓽??19:29	t
ad5e2d86-f9b6-438b-9110-9a8209e5d75e	2026-01-11	500000	?낃툑 ?댁뿭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑	308b645ab9b64c7a54690654c6ece4e4e47ea2abf11a9b23f2aef668831a22e8	?섏쭊 2痢??붿꽭	KRW	誘몃텇瑜?11:27	t
8b7710e9-484c-4036-9e9f-fdfcc326ce4c	2026-01-11	500000	?낃툑 ?댁뿭	?붿꽭	exclude	OK吏좏뀒?ы넻??c8b13291fdeb91b825c1c3c64af7427408c8377eabec741169020fbeb3cb03ca	?섏쭊 2痢??붿꽭 ?댁껜?댁뿭	KRW	誘몃텇瑜?12:44	t
8070504d-6a16-43c9-acfa-74455d00d65f	2026-01-11	3000	GS25?띾궔?쇱뒪?몄젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	8039ef2d9d7783a9878d9a3c08a1db70ccb2d6d38f22dbca7e852a65deafe080	\N	KRW	?몄쓽??19:43	t
e5a80751-dcea-4b31-bda5-eea33edcc4f4	2026-01-10	22570	?몃툙?쇰젅釉?媛?됱껌?ъ젏	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	a12e2a25a016d7c730be168847283b6b5992d00101bbd651e83923a437b9a521	\N	KRW	?몄쓽??20:36	t
be147f95-9be9-4340-a270-c0f6a13c1746	2026-01-09	46640	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	7d5da6ff7d23a87849e5dd5e5251ebd4fb468d8540d7c8079153c2f8e54ce736	\N	KRW	留덊듃	17:54	t
92f4d804-3f35-4885-a3eb-27daa78f75a9	2026-01-09	60000	異쒓툑 ?댁뿭	?먮?/?≪븘	expense	OK吏좏뀒?ы넻??573ac27437ba32d856e270549459a614c5a8a91f36acb3ebec0fb02a4a26199a	?대┛?댁쭛 ?쒕룞鍮?KRW	誘몃텇瑜?07:33	t
43415102-3923-445c-9a80-1429a09fee20	2026-01-07	19800	?꾨?諛깆쿇?몄젏	?⑥뀡/?쇳븨	expense	MULTI Any 移대뱶	1039348228a3cc49e8fbd953677121c151dbab2f446c6e0570b0e6e301dd4c24	\N	KRW	諛깊솕??17:57	t
73d8edda-6a2f-467c-a841-eb39b0adec8e	2026-01-07	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	600fc99d730533496d0eb8e593185faeb4449dbd8702dad3d9bad35a0c87e3fb	\N	KRW	而ㅽ뵾/?뚮즺	08:34	t
afcae8b2-0752-4b64-8377-dd07c20194d6	2026-01-07	4000	?뚮━諛붽쾶???곕??댄솕??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	a856f75631096b2dbf34cae7ca2bd59704ee44e20ece2423a5ee142e1d3b82da	\N	KRW	踰좎씠而ㅻ━	08:32	t
9e8b64fc-fec4-4a2c-a006-b83264de27bf	2026-01-06	22600	二쇱떇?뚯궗 ?곗븘?쒗삎?쒕뱾	?앸퉬	expense	?좎뒪 媛꾪렪寃곗젣	134a18cb76e9ddc51701fbb7f3fda2f1cb9b91e5d4d88480d8dc8cce6291ebd8	\N	KRW	諛곕떖	14:54	t
a74c4afa-5907-42b4-a1a9-9a76cedca7a1	2026-01-06	29300	?곗꽭?좎뾽 吏곸쁺?ㅽ넗???앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	536dd04c155136794b58baaf8918246f1fd85be481133c80f359302f88d92801	\N	KRW	?앹옱猷?13:15	t
4d2215ab-dfba-423c-bb4d-950f9c634d8b	2026-01-06	4500	移댄럹 ?щ옒??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	7dd82a09a5d82623634a2d4a8706d4d85edee68722f835036fa9442b6f11f115	\N	KRW	而ㅽ뵾/?뚮즺	08:53	t
02a8fea8-49b7-433b-9680-93a3a5d9b152	2026-01-06	4000	?뚮━諛붽쾶???곕??댄솕??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	acd5958e1db228e7753eecfe2e8a5ab823035918b415d38c6f0e0cefcd575374	\N	KRW	踰좎씠而ㅻ━	08:52	t
ad0684f8-05d0-457c-abf8-e86e3775b7d6	2026-01-05	4100	泥쒗샇?댁??⑦뵾遺怨??섎즺/嫄닿컯	expense	MULTI Any 移대뱶	560e7ed8b126fce9e8c583f42588adf66bd88afa03306b5cf92869c37e0c6534	\N	KRW	?쇰?怨?16:56	t
acd87b5c-a3ea-456a-9643-684fe8ded040	2026-01-05	1120	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	dd11a3ddb3b585738444496952e7db3245bd4f95dbfa57aac2abd4ab7618b52a	\N	KRW	?꾧린??08:42	t
53826e38-eead-4be1-bd9f-428aee1bd515	2026-01-05	1120	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	68a22bc2ef0c3462d6c580638b9bb078f9203be0540cdaf9162924719ee47e37	\N	KRW	?꾧린??08:42	t
8dc538e8-354e-433a-8b6b-df1f56de9166	2026-01-05	1120	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	ec6df33fa1a47682d577c355b025d4317fc9afe9e61a8bdf52de748d8eee93e5	\N	KRW	?꾧린??08:42	t
3d5c8c1f-501a-42c8-8ed7-e90dc98709e9	2026-01-05	1120	?쒓뎅?꾨젰怨듭궗(?먮룞?댁껜)	二쇨굅/?듭떊	expense	LOCA 365 移대뱶	858ef0f3d3a5b2fd154608c608c59c6f9e96ef53331087ae8cfcfb5d60b9530c	\N	KRW	?꾧린??08:42	t
a2730e25-562a-4a5c-9d40-aa7c9eb0eb4b	2026-01-04	13200	?쇱쓬?뺢뎅 ?꾩씠?ㅽ겕由쇳븷?몄젏 ?띾궔19	移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	31e30a0e8c4cf3abd6f3a5e374c87ef7103f55f9be65019d35df609702ed75e6	\N	KRW	?꾩씠?ㅽ겕由?鍮숈닔	18:39	t
06e08a0e-591d-4f2e-96b6-87b16965e9dd	2026-01-04	32000	??뱀껌怨??앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	18d8aafef9cfc9f01d806d7e57781a827b6f484fbe0582ced966b495bd10cc6c	\N	KRW	?앹옱猷?18:33	t
776f94e8-f6fb-4be6-8d02-86fe52580589	2026-01-04	10000	?꾨?諛깊솕??泥쒗샇???⑥뀡/?쇳븨	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	af7d3f05a82620fcb7730d6d6e479bf79ffb8800694f5cbffca6189711c602cc	\N	KRW	諛깊솕??18:18	t
44cf7ebf-7ff6-41be-9d67-32022dd2b30c	2026-01-04	8000	?꾨?諛깊솕??泥쒗샇???⑥뀡/?쇳븨	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	c2faa8cd06220ad5a14ff70ded5be3005539d05dea11db4b72091d9129994917	\N	KRW	諛깊솕??18:17	t
ec034ef1-4d87-4f66-836d-9397ef94ccf8	2026-01-07	2400	?⑥쑀(CU)?≫뙆?좎꽦???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	a8824529eb8aa5ce46b6a48b320ab27ec560f203977f2f314757d109f1b84cef	\N	KRW	?몄쓽??18:35	t
b5d48019-d261-4c1f-bd23-7d83030c75fc	2026-01-07	30	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	5fc2a3d4aee7c610e0ca3b767477252c2a94f3eb6bc19fa332e746aaadf53d56	\N	KRW	誘몃텇瑜?14:10	t
ce554b91-acbb-4267-945f-2f4d704db742	2026-01-07	10000	異쒓툑痍⑥냼 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	c8def2313f0d5497c31535311524ba3bc4248a55c2479c83cb749082aa8cf845	\N	KRW	誘몃텇瑜?14:10	t
1cb85da1-8880-4c53-81ff-47a9a75db9a2	2026-01-07	70000	異쒓툑 ?댁뿭	二쇨굅/?듭떊	expense	OK吏좏뀒?ы넻??324e49adb8bd63f4fa3d4c25508e26ac6d6b08d80c9b161ca65f58f06e6e5bad	?섏쭊 ?섎룄?섎━	KRW	誘몃텇瑜?08:45	t
6be061ba-6cdf-45d5-8433-a8c328ac7e75	2026-01-07	10000	(二??대땲?쒖뒪(鍮뚮쭅_?쇰컲)	?⑤씪?몄눥??exclude	?좎뒪諭낇겕 泥댄겕移대뱶	f53a08d325ec1dc50f54413b2a755f89d898f7bce02fe11c7f76ea64dd87ba4b	\N	KRW	?쒕퉬?ㅺ뎄??00:00	t
bd76f861-6428-4cf6-807d-735907946ba5	2026-01-06	322700	?쒖＜??났	?ы뻾/?숇컯	exclude	?좎뒪 媛꾪렪寃곗젣	c674aa1967fb2ef5da6945cca2537e739285b24760fb564cccd201d4b3b7d6cf	?쒖쫰?ㅼ뭅 ??났沅?痍⑥냼?댁뿭	KRW	??났沅?18:38	t
6b95274e-2c02-4cb6-9627-51f5c32062be	2026-01-06	313900	?쒖＜??났	?ы뻾/?숇컯	expense	?좎뒪 媛꾪렪寃곗젣	b877605886aeb6527efe49aaf0ddfee3161af949da9bdf3bbfe2d75347e30bdb	?쒖쫰?ㅼ뭅 ??났沅?KRW	??났沅?21:00	t
872cb9ee-bcfb-465c-8667-806fddec2a39	2026-01-06	322700	?좎뒪?섏씠_?쒖＜??났_TOSS	?ы뻾/?숇컯	exclude	kt 怨좉컼??Simple Life 移대뱶	54e38630dde23e8314c5c9e3462a91fd77ee861bbfd5430628140134888fcae6	?쒖쫰?ㅼ뭅 ??났沅?痍⑥냼?댁뿭	KRW	??났沅?18:38	t
51dcc4f8-15e8-4b72-9f1e-83059e946477	2026-01-06	67600	?묓뿬???먮?/?≪븘	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	b9e0cf9c3cde5a1b2286ba72a94e27bc4972aaa957be556d8b97a00a47f543c3	遊됰큺 鍮꾪?誘?3醫낆꽭??KRW	蹂댁“?앺뭹	17:32	t
06f8b7de-d8f0-4477-9a3e-595c30f7876e	2026-01-05	31500	?꾨줈??怨듭떇?ㅽ넗???앺솢	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	b967e0d6b438c673f8f36546d1e3c11c3abf17eb85c6e8bbb38025896f437198	?앷린?몄쿃湲??몄젣	KRW	?명긽	20:20	t
4831f192-2f64-49e5-9b32-a9387d3df743	2026-01-05	9480	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	MULTI Any 移대뱶	75de9bef319ae9bab5688fb1ec68686f13b5a99c2f56c4970112c9feed439338	\N	KRW	留덊듃	17:12	t
cf64898b-78f2-4717-a3d0-8aac0427e2bd	2026-01-04	15600	3M蹂몄궗吏곸쁺紐??⑤씪?몄눥??expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	62ff31ec6b9913e4d668741719d85a92310ca73e12e87e4a4973a0a1ecabc52c	\N	KRW	?명꽣?룹눥??15:18	t
6e57f119-e44e-4658-bda9-51c425a7e2a0	2026-01-04	54000	?꾨젋利덉뒪?щ┛(媛먯씪留덉쿇??J	臾명솕/?ш?	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	79cef6c9e8436c6bc0367faed389a3c0e1703f2f7be1c940ae8a3878c077d9c7	\N	KRW	?ㅽ룷痢?14:41	t
9e039201-75bd-4814-9917-65e893e98ec5	2026-01-04	70000	援щ룄?쇱꽌?섎궓二쇱쑀???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	a03782c11b2645e2fc2b97951907134946f853516ac1dfdafa4a9ebaa8799c33	\N	KRW	二쇱쑀	09:59	t
126d74a8-4ff9-4b32-97e2-45af03b32323	2026-01-04	9000	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	e80de76e8a631af29aaadfad9d85ad39da554589be2b4489a4bb81eb4bd798a2	\N	KRW	踰좎씠而ㅻ━	08:34	t
2041c159-71c8-4bff-bc0b-3e6ffa600de7	2026-01-04	3400	硫붽??좎??⑥빱???쒖슱?띾궔??移댄럹/媛꾩떇	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	0d22d0458e47801c75d5dbbc78d06f37924a7394791a121925f0b869993c5f78	\N	KRW	而ㅽ뵾/?뚮즺	08:26	t
ab56461e-35f1-4ad3-8419-108d7c6ca8ac	2026-01-04	4600	?댁궘 ?쒖슱_?≫뙆?띾궔??移댄럹/媛꾩떇	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	253c7dc6ef89b018ac6bd0e79d91afed15fcf76d6c3034e1c8ce6c1f21e10b36	\N	KRW	而ㅽ뵾/?뚮즺	08:11	t
a7feb5c8-45f2-44e0-a58b-f06824497920	2026-01-04	1600	怨듦났湲곌?_KPN	二쇨굅/?듭떊	expense	MULTI Any 移대뱶	d64cf58fbda00fe6077a7eab39014dd499abca32517857abf2aca88db120a396	\N	KRW	移대뱶	17:07	t
6c7fbb30-3bc2-4eb8-94db-c1c32610051e	2026-01-03	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	9b15f2f07d072f248ddeb406b0becb5cd8f6065a1c27e299e27512d038547ada	\N	KRW	泥좊룄	18:52	t
c1abc0a0-ec20-4be1-96dd-3ecc83ba70df	2026-01-03	2100	異쒓툑 ?댁뿭	誘몃텇瑜?expense	OK吏좏뀒?ы넻??f58183fc1d6042b7a631695ce8b6b8a1b848bdc9f80bfd8b1267a36ba44c76b8	\N	KRW	誘몃텇瑜?16:26	t
5fd158aa-36d9-48f8-97ad-fc029d219c3b	2026-01-03	17500	而ㅽ뵾?섏뿕(CoffeeFie	移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	48bbabcaf22384b87e53d41d1377c77934196e755d10b24b8ebfae271d7ec619	\N	KRW	而ㅽ뵾/?뚮즺	14:45	t
ac10219d-0a85-445a-9cba-428ed2c64a1b	2026-01-03	5000	?쒖슱???ㅼ쫰移댄럹 ?쒕┰	?먮?/?≪븘	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	d21c850f684c48159d9477493d0870bc50f28247aca9946c6044d5c40152eadc	\N	KRW	???泥댄뿕	14:12	t
fb41b55f-eee2-4fd8-b56b-f1ee48c44de9	2026-01-03	1500	?곕㉧??踰꾩뒪	援먰넻	expense	MULTI Any 移대뱶	113f506aad7811f9cca64e999e42b483333003938da956dd739d497dad9ee6a2	\N	KRW	?以묎탳??10:25	t
dda30e2d-4c88-4053-a75e-564a444271f9	2026-01-03	1750	?곕㉧??吏?섏쿋	援먰넻	expense	MULTI Any 移대뱶	db0c783e0b49883eb6c50c0cda3c8c026cd4be994b95b2ad22b6d801a58aff0b	\N	KRW	泥좊룄	07:49	t
cfd17513-37f5-45ae-b17f-98af3176491b	2026-01-02	21000	媛먮?移섑궓	?앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	92999cec3f1ff45386d8727efec600812b5822ed04dcfc5e0b85b0337e6e3995	\N	KRW	移섑궓	20:45	t
0ec9f5d0-b6b6-4fa9-912d-a79862b97d1b	2026-01-02	17	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	5e14bc453b0b4947ab2a27147febb298e9319d0aa17fb7ae13d81f84d346dd4b	\N	KRW	誘몃텇瑜?16:53	t
ac7af68a-58b8-4178-bc67-acf99721a1c0	2026-01-02	19600	寃?(二??먯씠釉붿빱?쇨렇猷?移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	901b1a615e7810f25b913912313bd49836084b23d5716658479cf4e223bbf5e7	\N	KRW	而ㅽ뵾/?뚮즺	14:36	t
b892ae5d-1c90-43e3-9e10-c2ff77ed39a3	2026-01-02	9200	?섏씠?⑥뒪 異쒗눜洹??먮룞李?expense	?꾨텋 ?섏씠?⑥뒪 ?듯뻾猷??꾩슜 移대뱶II	8479960f2f07843d0855058857ad00c1a81f5eaead5674a910ddde5a0560b6d0	\N	KRW	?듯뻾猷?00:00	t
bfac86ee-8725-4d17-8777-aaab6534a2fb	2026-01-02	56500	紐⑤컮??吏?섏쿋	援먰넻	expense	LOCA 365 移대뱶	08bbbb72448a40af020fa8bef185eb937cec80f8546f4f194315fa1db012752f	\N	KRW	泥좊룄	00:00	t
c54e288a-2ad4-4bca-8496-b867bdbcd93f	2026-01-02	16000	紐⑤컮??踰꾩뒪	援먰넻	expense	LOCA 365 移대뱶	dfa96603739b8f1e2be7a6299250934efaaf9518575e66d6f5820a1dff964dd9	\N	KRW	?以묎탳??00:00	t
105ccb82-3aa4-461f-b22d-0e4c7a99eda5	2026-01-01	10000	(二??대늻由?怨ㅼ??봊C???앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	8d2730e82f6aec6d0868a7ea99979ead368e3c4796c279e3ff6c0a0ab8adf88b	\N	KRW	?쒖떇	20:10	t
3aee9d90-11d9-4cb6-b63d-1551ba7996f6	2026-01-01	10000	?쇱꽦臾쇱궛(二? ?먮쾭?쒕뱶由?臾명솕/?ш?	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	37f41d8d7aa59eea5427b9d1027a7e86d4d4ac541244cf027f53df8bd83df125	\N	KRW	?뚮쭏?뚰겕	13:23	t
6c0f66c0-0bc8-4a06-afd6-f8dfa7eaa9de	2026-01-01	12000	?뚮━諛붽쾶??移댄럹/媛꾩떇	expense	MULTI Any 移대뱶	9112660c6fa2e1b33a699e2df31b8cdaf1d2786186400b87f0f46335032164ca	\N	KRW	誘몃텇瑜?11:55	t
3264cfd6-b60c-4b5f-9aaa-696c10f5c6d0	2026-01-31	220	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	daceee6e3640441bd06e6b37cd798c4d8fa38e8a8f4fdd10311e06bd7af79740	\N	KRW	誘몃텇瑜?12:00	t
ea815326-3f38-40f1-8d4a-0ee18c5f5397	2026-01-31	500000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	7b1d10762092921956e7edbed2e05fd910c894dad5126f91b46d3287d8741263	援λ뵒踰뚭툑	KRW	誘몃텇瑜?23:02	t
9a7e2f8e-1cf7-4f02-ab9c-341d5a6cec8c	2026-01-30	394997	??洹??닿퀎醫뚯씠泥?exclude	移댁뭅?ㅽ럹??癒몃땲	bd3d1178bf4f9eb001763628e0c77a1cac15730f6eb71adfd78d95b72a602c6d	?뚯뒳???먮ℓ湲덉븸	KRW	誘몃텇瑜?09:03	t
6264dcf5-1617-42c4-a223-23abbee9125c	2026-01-29	19770	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	bed72f0ad5fe6cb21c27872cf870814c1d34e83db69198eb1a238f4faf0e16b6	\N	KRW	留덊듃	16:02	t
b95cc942-7fb2-46b4-8c2c-f53fb722f5cd	2026-01-29	15470	?덊뵆?ъ뒪?듭뒪?꾨젅???띾궔???앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	d5bb0d68a077d7b430ab1efd2697b66ad74f19e5cf8e7e6732d226a39c4b6ce0	\N	KRW	留덊듃	12:38	t
015fdf79-7bee-4e72-a889-cc21635dcd2e	2026-01-27	3300	?⑥쑀 ?띾궔?ㅼ쑄???앸퉬	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	21210014636e7e1d96f32cc3a924110778419d6b2dc9fced11c9052b275be494	\N	KRW	?몄쓽??18:06	t
7921f2b1-1dc3-4d73-93b3-d017929ff20e	2026-01-23	289942	異쒓툑 ?댁뿭	?ы뻾/?숇컯	expense	?⑤씪?몄옄由쎌삁?곴툑	7a26e0f920bf5c1299435d6ca4af2b0f577b4a61d9e162007a6be6ffbacd5f6d	?쒖쫰?ㅼ뭅 ?명뀛鍮?KRW	誘몃텇瑜?08:22	t
c6e481e7-8b93-4aa8-bc34-7566973ccb49	2026-01-21	187140	異쒓툑 ?댁뿭	?異?expense	?⑤씪?몄옄由쎌삁?곴툑	84107e25a04319b288c0da522ca6f2e60973fce86bbc9c99166db2a2e976581d	?섏쭊 ?덈쭏???異??댁옄	KRW	?異쒖씠??05:05	t
6808ec7e-7038-4b9d-b5b4-f492bf7e2f2c	2026-01-21	100000	異쒓툑 ?댁뿭	二쇨굅/?듭떊	expense	?⑤씪?몄옄由쎌삁?곴툑	9ebf2a162a2e1738d72a9d5073436577e2cbcdaf8c2edac8c491ce516a71a5ef	援ν넻???명꽣?룸퉬 ?λえ???댁껜	KRW	誘몃텇瑜?08:20	t
cd373452-3715-40bb-8720-5bf00c5f1911	2026-01-16	30000	異쒓툑 ?댁뿭	寃쎌“/?좊Ъ	expense	OK吏좏뀒?ы넻??d90bc4d977eeb3b7a4fcc7ce490dce3dc492f5ca5c8adb191cc50ab5c4f82dc2	?댁쭅???〓퀎??媛곸텧	KRW	誘몃텇瑜?10:23	t
2b3cb064-48a6-4be6-ac8a-069b749c13ff	2026-01-13	817140	異쒓툑 ?댁뿭	移대뱶?湲?exclude	OK吏좏뀒?ы넻??bfc8eb8d13bafffe36b01337b6d4b732cb32196c6ebdc0e82d4e9c56a8b4b5a7	MGS 移대뱶?湲??댁껜?댁뿭	KRW	誘몃텇瑜?13:01	t
d2a7ab4c-d232-40dc-8a2e-27b3ce2dc00d	2026-01-12	500000	?낃툑 ?댁뿭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑	e16b06e409eae23b8e10ca9423e01244a26b8853d2b21c5b4a29133c235f22de	?섏쭊 1痢??붿꽭	KRW	?붿꽭	12:06	t
65e83bc8-9574-410d-a1a6-c29d6235d994	2026-01-02	100000	?낃툑 ?댁뿭	?붿꽭	income	?⑤씪?몄옄由쎌삁?곴툑	2b6e86ce84b93bdfc2520fc0dba5d6bb783fbb65ef0a6b0dec1dac6290675ee7	?섏쭊 吏痢??붿꽭	KRW	誘몃텇瑜?14:08	t
36a1088e-9c92-47e1-8b6f-77a7b2c26ebd	2026-01-02	100000	異쒓툑 ?댁뿭	誘몃텇瑜?exclude	?⑤씪?몄옄由쎌삁?곴툑	557e8776d08e32bdcf2ff63ce1ae76ab3828c88f2aacf61f1e8e2c77f9e13ad0	?섏쭊 吏痢??붿꽭 ?댁껜?댁뿭	KRW	誘몃텇瑜?14:30	t
cff75a68-9f9e-4c71-b6d3-a58031667ec5	2026-01-02	100000	?낃툑 ?댁뿭	誘몃텇瑜?exclude	OK吏좏뀒?ы넻??8801f88cd4a9e24bc077190d86bcf9ebcf652d6eaf6eabe187ae823e1875907a	?섏쭊 吏痢??붿꽭 ?댁껜?댁뿭	KRW	誘몃텇瑜?14:30	t
654dfe60-94f5-41ba-9ad0-863aa69f7547	2026-01-02	0	吏?먯뒪(GS)25 ?띾궔?꾨????앸퉬	expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	d1ca630ffdd038e0f0b43bf5418e3459385d8607edba58f9826d4a5d1488fe57	?ъ씤??寃곗젣	KRW	?몄쓽??09:56	t
150ff77f-1be3-4728-933e-3ec5528324a0	2026-01-01	25000	二쇱떇?뚯궗 移댁뭅?ㅻえ鍮뚮━???먮룞李?expense	移댁뭅?ㅽ럹??媛꾪렪寃곗젣	b061f9929127862e6b7a9f408fef0f18b14bd79c13e2375281c1caa8d89240e9	?먮쾭?쒕뱶 諛쒕젢	KRW	二쇱감	13:32	t
44912844-d9f6-4334-89ce-e2d8145de7ce	2026-01-01	284	?낃툑 ?댁뿭	誘몃텇瑜?exclude	?좎뒪諭낇겕 ?듭옣	d49e7754f730deacb55f9f370cf1b4476eaeef9e134b67c6abd1b52f47c1265e	\N	KRW	誘몃텇瑜?05:12	t
e24f8a23-e332-4944-9431-7dbdd9f4276f	2026-01-11	500000	異쒓툑 ?댁뿭	?붿꽭	exclude	?⑤씪?몄옄由쎌삁?곴툑	8020f8c92c3539c3ebab22422b3500bb8b239c5c577fa444e2ffbf30745fc7fb	?섏쭊 2痢??붿꽭 ?댁껜?댁뿭	KRW	誘몃텇瑜?12:44	t
fbba50ec-f5be-4b4d-ab63-5e805b3577aa	2026-01-08	105000	RaRas ?쇰씪???쇳븨	expense	?ㅼ씠踰꾪럹??媛꾪렪寃곗젣	93fdea35995f2e4ab8aa622092a0da52fd37bcd2bd707fb0ee6753c5f46df993	??異쒖궛 ?좊Ъ	KRW	?≪븘?⑺뭹	00:09	t
4ab4593a-4bca-453a-bdca-9d52ceac1b87	2026-01-06	322700	?좎뒪?섏씠_?쒖＜??났_TOSS	?ы뻾/?숇컯	exclude	kt 怨좉컼??Simple Life 移대뱶	fa33193b36d2fb796fe2f77d6309e3af2c680d4ee37808f986331ed6718b81e1	?쒖쫰?ㅼ뭅 ??났沅?痍⑥냼?댁뿭	KRW	??났沅?20:53	t
ee97b0d6-82a4-47b8-b8bd-ddf14bf6a7d2	2026-01-02	5900	?좎뒪?꾨씪???⑤씪?몄눥??exclude	?좎뒪 媛꾪렪寃곗젣	8abbf13480bf3eaa070ac9a9e6ec3a8272ec7b2f2b3e4fcfde90db57a92dafc2	???듭옣 寃곗젣	KRW	?쒕퉬?ㅺ뎄??16:53	t
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
hh1Do2UbZFUkTU8AVqtaDqJhhrHwukE2	{"role": "admin", "cookie": {"path": "/", "secure": true, "expires": "2026-05-12T21:08:23.280Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}, "authenticated": true}	2026-05-12 21:08:24
3wYsW9x1y6V47OZeeXIY6cJVZKVIEsMO	{"role": "admin", "cookie": {"path": "/", "secure": true, "expires": "2026-05-13T23:36:21.031Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}, "authenticated": true}	2026-05-14 07:44:23
\.


--
-- Name: AssetHistory AssetHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssetHistory"
    ADD CONSTRAINT "AssetHistory_pkey" PRIMARY KEY (id);


--
-- Name: Asset Asset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_pkey" PRIMARY KEY (id);


--
-- Name: CategoryGroupRule CategoryGroupRule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CategoryGroupRule"
    ADD CONSTRAINT "CategoryGroupRule_pkey" PRIMARY KEY (id);


--
-- Name: CategoryRule CategoryRule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CategoryRule"
    ADD CONSTRAINT "CategoryRule_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: ExclusionRule ExclusionRule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExclusionRule"
    ADD CONSTRAINT "ExclusionRule_pkey" PRIMARY KEY (id);


--
-- Name: IgnoredRule IgnoredRule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IgnoredRule"
    ADD CONSTRAINT "IgnoredRule_pkey" PRIMARY KEY (id);


--
-- Name: PaymentRule PaymentRule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentRule"
    ADD CONSTRAINT "PaymentRule_pkey" PRIMARY KEY (id);


--
-- Name: RecurringTransaction RecurringTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RecurringTransaction"
    ADD CONSTRAINT "RecurringTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: AssetHistory_yearMonth_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AssetHistory_yearMonth_key" ON public."AssetHistory" USING btree ("yearMonth");


--
-- Name: Asset_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Asset_name_key" ON public."Asset" USING btree (name);


--
-- Name: CategoryGroupRule_categoryName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CategoryGroupRule_categoryName_key" ON public."CategoryGroupRule" USING btree ("categoryName");


--
-- Name: CategoryRule_keyword_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CategoryRule_keyword_key" ON public."CategoryRule" USING btree (keyword);


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: ExclusionRule_keyword_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ExclusionRule_keyword_key" ON public."ExclusionRule" USING btree (keyword);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: IgnoredRule_keyword_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IgnoredRule_keyword_key" ON public."IgnoredRule" USING btree (keyword);


--
-- Name: PaymentRule_keyword_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PaymentRule_keyword_key" ON public."PaymentRule" USING btree (keyword);


--
-- Name: Transaction_hash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Transaction_hash_key" ON public."Transaction" USING btree (hash);


--
-- Name: session_sid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX session_sid_key ON public.session USING btree (sid);


--
-- PostgreSQL database dump complete
--

\unrestrict oEXwsHs3fz3T7lYgqsyn6xbhaw3DB6Mqcf6WTaxLwJiZMmOS3zJ7dZTALdwy04e

