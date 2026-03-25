-- PostgreSQL database dump
--

\restrict XkmUBc8NJfeFxobzfzALyfOZxce6MKFwwPeR1lRuhYz2UHjU8Be6PG3LiLwDyhK

-- Dumped from database version 17.8 (a284a84)
-- Dumped by pg_dump version 18.1 (Ubuntu 18.1-1.pgdg22.04+2)

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
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neon_auth
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neon_auth;

--
-- Name: trg_lock_base_components(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.trg_lock_base_components() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only fire when base_components actually changes
  IF NEW.base_components IS NOT DISTINCT FROM OLD.base_components THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM payments WHERE ledger_id = OLD.id LIMIT 1
  ) THEN
    RAISE EXCEPTION
      'base_components are immutable once a payment exists for ledger %', OLD.id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trg_lock_base_components() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE neon_auth.account OWNER TO neon_auth;

--
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" uuid NOT NULL
);


ALTER TABLE neon_auth.invitation OWNER TO neon_auth;

--
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone
);


ALTER TABLE neon_auth.jwks OWNER TO neon_auth;

--
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE neon_auth.member OWNER TO neon_auth;

--
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);


ALTER TABLE neon_auth.organization OWNER TO neon_auth;

--
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL,
    plugin_configs jsonb,
    webhook_config jsonb
);


ALTER TABLE neon_auth.project_config OWNER TO neon_auth;

--
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL,
    "impersonatedBy" text,
    "activeOrganizationId" text
);


ALTER TABLE neon_auth.session OWNER TO neon_auth;

--
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


ALTER TABLE neon_auth."user" OWNER TO neon_auth;

--
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE neon_auth.verification OWNER TO neon_auth;

--
-- Name: academic_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.academic_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_closed boolean DEFAULT false NOT NULL,
    closed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_promotion_locked boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_closed_at CHECK ((((is_closed = false) AND (closed_at IS NULL)) OR ((is_closed = true) AND (closed_at IS NOT NULL)))),
    CONSTRAINT chk_dates CHECK ((end_date > start_date))
);


ALTER TABLE public.academic_sessions OWNER TO neondb_owner;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    expense_date date NOT NULL,
    paid_to text NOT NULL,
    mode text NOT NULL,
    recorded_by text NOT NULL,
    reference text,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT expenses_category_check CHECK ((category = ANY (ARRAY['SALARY'::text, 'UTILITY'::text, 'MAINTENANCE'::text, 'PURCHASE'::text, 'OTHER'::text]))),
    CONSTRAINT expenses_mode_check CHECK ((mode = ANY (ARRAY['CASH'::text, 'BANK'::text, 'UPI'::text])))
);


ALTER TABLE public.expenses OWNER TO neondb_owner;

--
-- Name: fee_structures; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.fee_structures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id text NOT NULL,
    academic_session_id uuid NOT NULL,
    status text NOT NULL,
    components jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    version integer DEFAULT 1,
    CONSTRAINT fee_structures_status_check CHECK ((status = ANY (ARRAY['DRAFT'::text, 'ACTIVE'::text])))
);


ALTER TABLE public.fee_structures OWNER TO neondb_owner;

--
-- Name: ledger_adjustments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ledger_adjustments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ledger_id uuid NOT NULL,
    type text NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text NOT NULL,
    approved_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_adjustment_sign CHECK ((((type = ANY (ARRAY['DISCOUNT'::text, 'CONCESSION'::text, 'WAIVER'::text])) AND (amount < (0)::numeric)) OR ((type = ANY (ARRAY['EXTRA'::text, 'LATE_FEE'::text])) AND (amount > (0)::numeric)))),
    CONSTRAINT ledger_adjustments_amount_check CHECK ((amount <> (0)::numeric)),
    CONSTRAINT ledger_adjustments_type_check CHECK ((type = ANY (ARRAY['DISCOUNT'::text, 'CONCESSION'::text, 'WAIVER'::text, 'EXTRA'::text, 'LATE_FEE'::text])))
);


ALTER TABLE public.ledger_adjustments OWNER TO neondb_owner;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ledger_id uuid NOT NULL,
    student_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    mode text NOT NULL,
    reference text,
    collected_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT payments_mode_check CHECK ((mode = ANY (ARRAY['CASH'::text, 'UPI'::text, 'BANK'::text, 'CARD'::text, 'CHEQUE'::text])))
);


ALTER TABLE public.payments OWNER TO neondb_owner;

--
-- Name: student_fee_ledgers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.student_fee_ledgers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id text NOT NULL,
    class_id text NOT NULL,
    academic_session_id uuid NOT NULL,
    base_components jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_base_components_array CHECK (((jsonb_typeof(base_components) = 'array'::text) AND (jsonb_array_length(base_components) > 0)))
);


ALTER TABLE public.student_fee_ledgers OWNER TO neondb_owner;

--
-- Name: ledger_summary; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.ledger_summary AS
 SELECT l.id AS ledger_id,
    l.student_id,
    l.class_id,
    s.name AS academic_year,
    s.is_closed,
    COALESCE(base.base_total, (0)::numeric) AS base_total,
    COALESCE(adj.adjustments_total, (0)::numeric) AS adjustments_total,
    COALESCE(pay.paid_total, (0)::numeric) AS paid_total
   FROM ((((public.student_fee_ledgers l
     JOIN public.academic_sessions s ON ((s.id = l.academic_session_id)))
     LEFT JOIN ( SELECT l2.id AS ledger_id,
            sum(((c.value ->> 'amount'::text))::numeric) AS base_total
           FROM public.student_fee_ledgers l2,
            LATERAL jsonb_array_elements(l2.base_components) c(value)
          GROUP BY l2.id) base ON ((base.ledger_id = l.id)))
     LEFT JOIN ( SELECT ledger_adjustments.ledger_id,
            sum(ledger_adjustments.amount) AS adjustments_total
           FROM public.ledger_adjustments
          GROUP BY ledger_adjustments.ledger_id) adj ON ((adj.ledger_id = l.id)))
     LEFT JOIN ( SELECT payments.ledger_id,
            sum(payments.amount) AS paid_total
           FROM public.payments
          GROUP BY payments.ledger_id) pay ON ((pay.ledger_id = l.id)));


ALTER VIEW public.ledger_summary OWNER TO neondb_owner;

--
-- Name: finance_monthly_summary; Type: MATERIALIZED VIEW; Schema: public; Owner: neondb_owner
--

CREATE MATERIALIZED VIEW public.finance_monthly_summary AS
 WITH sessions AS (
         SELECT academic_sessions.name AS academic_year,
            academic_sessions.start_date,
            academic_sessions.end_date
           FROM public.academic_sessions
        ), months AS (
         SELECT s.academic_year,
            generate_series(date_trunc('month'::text, (s.start_date)::timestamp with time zone), date_trunc('month'::text, (s.end_date)::timestamp with time zone), '1 mon'::interval) AS month
           FROM sessions s
        ), income AS (
         SELECT ls.academic_year,
            date_trunc('month'::text, p.created_at) AS month,
            sum(p.amount) AS income_total
           FROM (public.payments p
             JOIN public.ledger_summary ls ON ((ls.ledger_id = p.ledger_id)))
          GROUP BY ls.academic_year, (date_trunc('month'::text, p.created_at))
        ), expense AS (
         SELECT s.academic_year,
            date_trunc('month'::text, (e_1.expense_date)::timestamp with time zone) AS month,
            sum(e_1.amount) AS expense_total
           FROM (public.expenses e_1
             JOIN sessions s ON (((e_1.expense_date >= s.start_date) AND (e_1.expense_date <= s.end_date))))
          GROUP BY s.academic_year, (date_trunc('month'::text, (e_1.expense_date)::timestamp with time zone))
        )
 SELECT m.academic_year,
    m.month,
    COALESCE(i.income_total, (0)::numeric) AS income_total,
    COALESCE(e.expense_total, (0)::numeric) AS expense_total,
    (COALESCE(i.income_total, (0)::numeric) - COALESCE(e.expense_total, (0)::numeric)) AS net_total
   FROM ((months m
     LEFT JOIN income i ON (((m.academic_year = i.academic_year) AND (m.month = i.month))))
     LEFT JOIN expense e ON (((m.academic_year = e.academic_year) AND (m.month = e.month))))
  ORDER BY m.academic_year, m.month
  WITH NO DATA;


ALTER MATERIALIZED VIEW public.finance_monthly_summary OWNER TO neondb_owner;

--
-- Name: financial_audits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.financial_audits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    performed_by text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.financial_audits OWNER TO neondb_owner;

--
-- Name: playing_with_neon; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.playing_with_neon (
    id integer NOT NULL,
    name text NOT NULL,
    value real
);


ALTER TABLE public.playing_with_neon OWNER TO neondb_owner;

--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.playing_with_neon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playing_with_neon_id_seq OWNER TO neondb_owner;

--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.playing_with_neon_id_seq OWNED BY public.playing_with_neon.id;


--
-- Name: playing_with_neon id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playing_with_neon ALTER COLUMN id SET DEFAULT nextval('public.playing_with_neon_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invitation; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.invitation (id, "organizationId", email, role, status, "expiresAt", "createdAt", "inviterId") FROM stdin;
\.


--
-- Data for Name: jwks; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.jwks (id, "publicKey", "privateKey", "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: member; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.member (id, "organizationId", "userId", role, "createdAt") FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.organization (id, name, slug, logo, "createdAt", metadata) FROM stdin;
\.


--
-- Data for Name: project_config; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.project_config (id, name, endpoint_id, created_at, updated_at, trusted_origins, social_providers, email_provider, email_and_password, allow_localhost, plugin_configs, webhook_config) FROM stdin;
2adaed4e-d172-45c5-9094-595d21831589	SKA-school-management	ep-shy-math-aidnrg8r	2026-03-05 10:17:27.993+00	2026-03-05 10:17:27.993+00	[]	[{"id": "google", "isShared": true}]	{"type": "shared"}	{"enabled": true, "disableSignUp": false, "emailVerificationMethod": "otp", "requireEmailVerification": false, "autoSignInAfterVerification": true, "sendVerificationEmailOnSignIn": false, "sendVerificationEmailOnSignUp": false}	t	{"organization": {"config": {"creatorRole": "owner", "organizationLimit": 1, "allowUserToCreateOrganization": true}, "enabled": true}}	{"enabled": false, "enabledEvents": [], "timeoutSeconds": 5}
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId", "impersonatedBy", "activeOrganizationId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role, banned, "banReason", "banExpires") FROM stdin;
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: academic_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.academic_sessions (id, name, start_date, end_date, is_closed, closed_at, created_at, is_promotion_locked) FROM stdin;
dedfb068-3d7b-42ba-9d4e-d59fdfd0480a	2023-2024	2023-04-01	2024-03-31	t	2024-03-31 00:00:00+00	2026-03-15 14:31:44.668289+00	t
ea0626ec-545c-439b-a5e4-674f33b2680c	2024-2025	2024-04-01	2025-03-31	f	\N	2026-03-15 14:31:44.668289+00	f
4c18f13d-aea9-47fc-8b54-62be6bff6de1	2025-2026	2025-04-01	2026-03-31	f	\N	2026-03-15 14:31:44.668289+00	f
ac754cca-e49f-4792-833d-9195c7f3b6c4	2025-26	2025-04-01	2026-03-31	f	\N	2026-03-22 08:32:26.641023+00	f
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expenses (id, category, description, amount, expense_date, paid_to, mode, recorded_by, reference, recorded_at) FROM stdin;
5e97306f-22ae-4d76-b3b2-0bfe39efc004	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:09.230875+00
849e052e-0ebd-4f0d-a37d-d1be2130beaa	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:09.943443+00
58f0cc28-a9a5-4853-bc2a-296b3567c4f7	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:10.535788+00
a3835fba-cadb-4b8b-9756-0e029b199cd4	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:10.631842+00
b44d5604-ee00-48bd-8306-8b7629ea5a3f	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:11.00828+00
a323b4b9-1b50-4768-baf5-4bc64c7d0b36	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:11.175149+00
1e1a4ffe-c24a-4f05-8275-7504b50c81c2	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:11.353599+00
043ce9ff-3373-434e-9efe-9e8c03d00ea4	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:11.543733+00
b942216c-3adf-423d-9e2c-c16daf0a5989	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:11.838897+00
7a0227e5-1ee8-4910-ba8c-55186f79d06a	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:12.171182+00
60e8df24-ecab-49b2-9013-cf84647621eb	SALARY	HEyyy	5000.00	2026-03-03	NEwschool	CASH	Admin	\N	2026-03-15 18:08:13.212342+00
d4815b82-1be6-4147-be56-b804fcaab45c	SALARY	for her greatness	5000.00	2026-03-04	akshaya	CASH	Admin	\N	2026-03-22 18:59:08.11968+00
206b6267-75dc-41ae-862c-a356dad53be8	SALARY	for her greatness	5000.00	2026-03-04	akshaya	CASH	Admin	\N	2026-03-22 18:59:15.123396+00
2968385c-b64b-4e92-9dae-a26df353f7af	SALARY	her beauty	6000.00	2026-03-13	akshaya	CASH	Admin	\N	2026-03-22 19:00:03.65747+00
cc6fdf28-5931-48d2-8a3d-675bdb117536	MAINTENANCE	skincare	10000.00	2026-03-11	akshaya	UPI	Admin	\N	2026-03-22 19:31:13.775908+00
\.


--
-- Data for Name: fee_structures; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.fee_structures (id, class_id, academic_session_id, status, components, created_at, version) FROM stdin;
fe9ed5db-de38-422d-a9c7-e619fbe09270	69875a31b4e12b16d2c16849	4c18f13d-aea9-47fc-8b54-62be6bff6de1	ACTIVE	[{"id": "6d65bbe5-217f-4a87-ad42-1eac6b1238c5", "name": "Tution ", "amount": 5000, "mandatory": true}]	2026-03-15 14:42:18.454042+00	1
751f519c-0dfe-4a79-8888-756618d43f05	69bfa98cd3a98fea3187415c	4c18f13d-aea9-47fc-8b54-62be6bff6de1	ACTIVE	[{"id": "150cc0c4-7ccc-4cdb-9475-d65cef376daf", "name": "Tuition", "amount": 25000, "mandatory": true}, {"id": "fa5e7209-24e9-4b17-899c-614b1ce6f143", "name": "Sports", "amount": 2000, "mandatory": true}, {"id": "84456643-6dea-4e7d-acaf-28f0d465d5cf", "name": "Uniform", "amount": 1500, "mandatory": false}]	2026-03-22 08:35:45.055173+00	1
6cdff46b-3218-4f74-8052-37c2a831d92b	69bfa98cd3a98fea31874151	4c18f13d-aea9-47fc-8b54-62be6bff6de1	ACTIVE	[{"id": "4d0ed1e4-fb88-4554-8394-74a2edaa4a8f", "name": "tution", "amount": 30000, "mandatory": true}, {"id": "28672a97-9fbe-46d9-a1c4-63e77f9b8e31", "name": "sports", "amount": 1000, "mandatory": true}, {"id": "56b88a92-8279-4e33-b5c5-d7ae09fce429", "name": "uniform", "amount": 500, "mandatory": true}]	2026-03-23 11:05:50.883096+00	1
\.


--
-- Data for Name: financial_audits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.financial_audits (id, event_type, entity_type, entity_id, performed_by, metadata, created_at) FROM stdin;
a3e11715-8c86-4914-9c60-159666b1dcff	LEDGER_CREATED	STUDENT_FEE_LEDGER	6f493d44-4fcc-4d21-bf86-756b43902d72	69aa74332314cad951d592fa	{"classId": "69875a31b4e12b16d2c16843", "studentId": "69aa9466a6e5fcc3f6cc3aeb", "academicSessionId": "4c18f13d-aea9-47fc-8b54-62be6bff6de1"}	2026-03-15 14:50:53.937869+00
676f5ee3-54f9-479f-8262-62ae0fecfef2	ADJUSTMENT_ADDED	LEDGER_ADJUSTMENT	5d1f20fb-ea61-4064-8ad9-3ebd2383e103	69aa74332314cad951d592fa	{"type": "DISCOUNT", "amount": -3000, "reason": "Discount", "ledgerId": "6f493d44-4fcc-4d21-bf86-756b43902d72", "approvedBy": "Admin"}	2026-03-15 14:54:57.744396+00
42372008-2831-48d8-820a-c811f31e05d6	ADJUSTMENT_ADDED	LEDGER_ADJUSTMENT	efee5baa-9d4a-4989-97ad-d3c02686ef32	69aa74332314cad951d592fa	{"type": "DISCOUNT", "amount": -200, "reason": "holiday", "ledgerId": "6f493d44-4fcc-4d21-bf86-756b43902d72", "approvedBy": "Admin"}	2026-03-15 15:06:59.305636+00
33ba1fc2-ec14-421e-ad91-9182b882cb73	PAYMENT_RECORDED	PAYMENT	083c9a80-fea4-40d3-b781-770ae9b9cabe	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "ledgerId": "6f493d44-4fcc-4d21-bf86-756b43902d72", "studentId": "69aa9466a6e5fcc3f6cc3aeb", "collectedBy": "Admin"}	2026-03-15 15:07:07.774893+00
533ec1d5-59d0-49c0-962b-819698463a8d	ADJUSTMENT_ADDED	LEDGER_ADJUSTMENT	bb174ab5-1ec5-4540-9ae5-ff93c129b88c	69aa74332314cad951d592fa	{"type": "DISCOUNT", "amount": -300, "reason": "No reason", "ledgerId": "6f493d44-4fcc-4d21-bf86-756b43902d72", "approvedBy": "Admin"}	2026-03-15 15:09:01.989376+00
31907f5d-a8d6-4808-9117-fcac20e70c11	PAYMENT_RECORDED	PAYMENT	18fa5d4a-2eba-4fcc-8138-7b217cdf06ef	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 4000, "ledgerId": "6f493d44-4fcc-4d21-bf86-756b43902d72", "studentId": "69aa9466a6e5fcc3f6cc3aeb", "collectedBy": "Admin"}	2026-03-15 15:09:14.105106+00
4bf71042-1e21-4607-8e5e-3e814ee19b92	EXPENSE_CREATED	EXPENSE	5e97306f-22ae-4d76-b3b2-0bfe39efc004	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:10.325855+00
04dffd7d-9258-470a-8322-1fef90de809c	EXPENSE_CREATED	EXPENSE	849e052e-0ebd-4f0d-a37d-d1be2130beaa	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:11.131878+00
1da45940-2928-4f17-8449-e506ee2f5986	EXPENSE_CREATED	EXPENSE	a3835fba-cadb-4b8b-9756-0e029b199cd4	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:11.300263+00
869c3f01-1cf9-44c5-a0b6-85d69bef2d5e	EXPENSE_CREATED	EXPENSE	58f0cc28-a9a5-4853-bc2a-296b3567c4f7	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:11.566722+00
dd57641f-8c61-460c-82bc-7fc9595f632a	EXPENSE_CREATED	EXPENSE	b44d5604-ee00-48bd-8306-8b7629ea5a3f	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:11.66828+00
1fb1d999-8d7d-4f64-8068-c5e37db2bba7	EXPENSE_CREATED	EXPENSE	a323b4b9-1b50-4768-baf5-4bc64c7d0b36	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:11.783899+00
8c7ccf5f-21ba-4ae5-98dd-39a42e8dfae3	EXPENSE_CREATED	EXPENSE	1e1a4ffe-c24a-4f05-8275-7504b50c81c2	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:12.013438+00
7cd255a2-a11f-4842-8197-43f0ed4aba33	EXPENSE_CREATED	EXPENSE	043ce9ff-3373-434e-9efe-9e8c03d00ea4	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:12.184861+00
b2c943bf-b9a6-41c5-b7d4-99a95117158c	EXPENSE_CREATED	EXPENSE	b942216c-3adf-423d-9e2c-c16daf0a5989	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:12.47328+00
c4c0d53a-7286-49e5-a035-fcfe72ad1870	EXPENSE_CREATED	EXPENSE	7a0227e5-1ee8-4910-ba8c-55186f79d06a	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:12.809534+00
965a2686-ca7d-40d3-b5e3-ca81a95ed981	EXPENSE_CREATED	EXPENSE	60e8df24-ecab-49b2-9013-cf84647621eb	69aa74332314cad951d592fa	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-03"}	2026-03-15 18:08:13.81852+00
46230416-e907-46a6-90a9-3ad4b0380f0e	EXPENSE_CREATED	EXPENSE	d4815b82-1be6-4147-be56-b804fcaab45c	69bfa04e9a1fef2fed697f4a	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-04"}	2026-03-22 18:59:09.756678+00
229fd70a-ba69-4edb-ae10-324178dea678	EXPENSE_CREATED	EXPENSE	206b6267-75dc-41ae-862c-a356dad53be8	69bfa04e9a1fef2fed697f4a	{"mode": "CASH", "amount": 5000, "category": "SALARY", "expenseDate": "2026-03-04"}	2026-03-22 18:59:16.315515+00
828d19fb-ada6-4b47-b3e3-c152e8cea2a3	EXPENSE_CREATED	EXPENSE	2968385c-b64b-4e92-9dae-a26df353f7af	69bfa04e9a1fef2fed697f4a	{"mode": "CASH", "amount": 6000, "category": "SALARY", "expenseDate": "2026-03-13"}	2026-03-22 19:00:06.624932+00
34e8bba1-0d58-4a03-a71c-b7aadda4dd0a	EXPENSE_CREATED	EXPENSE	cc6fdf28-5931-48d2-8a3d-675bdb117536	69bfa04e9a1fef2fed697f4a	{"mode": "UPI", "amount": 10000, "category": "MAINTENANCE", "expenseDate": "2026-03-11"}	2026-03-22 19:31:15.096554+00
d0f69608-5e5c-4bd2-8693-a24fea4deae0	LEDGER_CREATED	STUDENT_FEE_LEDGER	5d876882-9c57-42ce-8584-6ee16bcc9c7a	69bfa5735e9f91f755873fc8	{"classId": "69bfa98cd3a98fea31874151", "studentId": "69c10aba37e8b4bdcf78e09f", "academicSessionId": "4c18f13d-aea9-47fc-8b54-62be6bff6de1"}	2026-03-24 05:42:27.532525+00
4c486913-f7fb-4d06-939a-6a7f14f75420	LEDGER_CREATED	STUDENT_FEE_LEDGER	52f1fddb-0c35-476f-8992-07057b6bdb05	69bfa5735e9f91f755873fc8	{"classId": "69bfa98cd3a98fea31874151", "studentId": "69c1147837e8b4bdcf78e0a1", "academicSessionId": "4c18f13d-aea9-47fc-8b54-62be6bff6de1"}	2026-03-24 05:43:38.959883+00
e96bd753-7720-4248-9bf6-b6c2c7ae9dc0	PAYMENT_RECORDED	PAYMENT	669172ab-1344-4ffa-9e97-beb11c442215	69bfa5735e9f91f755873fc8	{"mode": "CASH", "amount": 5000, "ledgerId": "5d876882-9c57-42ce-8584-6ee16bcc9c7a", "studentId": "69c10aba37e8b4bdcf78e09f", "collectedBy": "Admin"}	2026-03-24 05:45:45.366172+00
96d324e4-c6af-4774-9cbb-8460e9413525	PAYMENT_RECORDED	PAYMENT	67df485b-318c-445f-844f-9046c1575454	69bfa5735e9f91f755873fc8	{"mode": "CASH", "amount": 5000, "ledgerId": "52f1fddb-0c35-476f-8992-07057b6bdb05", "studentId": "69c1147837e8b4bdcf78e0a1", "collectedBy": "Admin"}	2026-03-24 05:49:51.224324+00
af8a0668-dd9c-4c33-99bf-b4d600472863	ADJUSTMENT_ADDED	LEDGER_ADJUSTMENT	f1081303-fc21-4ad9-accc-371fab946f24	69bfa5735e9f91f755873fc8	{"type": "DISCOUNT", "amount": -4000, "reason": "Family", "ledgerId": "52f1fddb-0c35-476f-8992-07057b6bdb05", "approvedBy": "Admin"}	2026-03-24 05:50:03.797645+00
ad982a2b-72c4-44a3-b0e9-a7632e522d7a	PAYMENT_RECORDED	PAYMENT	da65d651-9270-4a7c-a217-8fe11a11115c	69bfa5735e9f91f755873fc8	{"mode": "CASH", "amount": 6000, "ledgerId": "52f1fddb-0c35-476f-8992-07057b6bdb05", "studentId": "69c1147837e8b4bdcf78e0a1", "collectedBy": "Admin"}	2026-03-24 05:50:14.139244+00
0f4c20dd-1661-467f-a0ff-a0ebef4d63bc	PAYMENT_RECORDED	PAYMENT	2a39ee2d-ac1f-48bf-abc9-3bffa163a906	69bfa5735e9f91f755873fc8	{"mode": "CASH", "amount": 7000, "ledgerId": "52f1fddb-0c35-476f-8992-07057b6bdb05", "studentId": "69c1147837e8b4bdcf78e0a1", "collectedBy": "Admin"}	2026-03-24 05:50:26.052406+00
894c3cb5-27f2-4954-af41-30e4fc7af154	PAYMENT_RECORDED	PAYMENT	6ea0c35a-4654-49f8-90da-7de64cfe6e88	69bfa5735e9f91f755873fc8	{"mode": "CASH", "amount": 9000, "ledgerId": "52f1fddb-0c35-476f-8992-07057b6bdb05", "studentId": "69c1147837e8b4bdcf78e0a1", "collectedBy": "Admin"}	2026-03-24 05:50:36.247197+00
3df85a75-a3d8-412d-b19f-05520640e55a	PAYMENT_RECORDED	PAYMENT	fc43d186-69b5-4578-9031-82a6f30f2b9d	69bfa5735e9f91f755873fc8	{"mode": "CASH", "amount": 500, "ledgerId": "52f1fddb-0c35-476f-8992-07057b6bdb05", "studentId": "69c1147837e8b4bdcf78e0a1", "collectedBy": "Admin"}	2026-03-24 05:50:46.705303+00
b8bb4af2-d18d-48b1-b38e-8d8502f4c8e7	PAYMENT_RECORDED	PAYMENT	745ef6a2-525e-404c-9c9b-3acdc7381b10	69bfa5735e9f91f755873fc8	{"mode": "CASH", "amount": 10000, "ledgerId": "5d876882-9c57-42ce-8584-6ee16bcc9c7a", "studentId": "69c10aba37e8b4bdcf78e09f", "collectedBy": "Admin"}	2026-03-24 06:11:21.242243+00
06de8afd-19b9-4380-bf2c-f1e5dd5c9e9c	ADJUSTMENT_ADDED	LEDGER_ADJUSTMENT	ca9b0d31-9181-4963-a13b-1ffd1fa5e31e	69bfa5735e9f91f755873fc8	{"type": "DISCOUNT", "amount": -4000, "reason": "Family", "ledgerId": "5d876882-9c57-42ce-8584-6ee16bcc9c7a", "approvedBy": "Admin"}	2026-03-24 06:11:38.03143+00
dd75924c-8344-4de4-ae33-69a665f262e6	PAYMENT_RECORDED	PAYMENT	37a34814-4a47-4854-9601-82780623c620	69bfa5735e9f91f755873fc8	{"mode": "CASH", "amount": 12500, "ledgerId": "5d876882-9c57-42ce-8584-6ee16bcc9c7a", "studentId": "69c10aba37e8b4bdcf78e09f", "collectedBy": "Admin"}	2026-03-24 06:11:52.841141+00
556752a8-51e9-4e30-8ba5-f630b002c5e2	LEDGER_CREATED	STUDENT_FEE_LEDGER	ea3dcb10-0850-4932-adb0-7e37b249ff83	69bfa5735e9f91f755873fc8	{"classId": "69bfa98cd3a98fea31874151", "studentId": "69c1154437e8b4bdcf78e0a3", "academicSessionId": "4c18f13d-aea9-47fc-8b54-62be6bff6de1"}	2026-03-24 08:57:24.967036+00
89a683a6-9671-4950-80f7-58a087bbcc99	PAYMENT_RECORDED	PAYMENT	c805be9b-f2ab-47ab-8f84-b7826a82c9f2	69bfa5735e9f91f755873fc8	{"mode": "UPI", "amount": 20000, "ledgerId": "ea3dcb10-0850-4932-adb0-7e37b249ff83", "studentId": "69c1154437e8b4bdcf78e0a3", "collectedBy": "Admin"}	2026-03-24 08:57:55.880965+00
\.


--
-- Data for Name: ledger_adjustments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ledger_adjustments (id, ledger_id, type, amount, reason, approved_by, created_at) FROM stdin;
5d1f20fb-ea61-4064-8ad9-3ebd2383e103	6f493d44-4fcc-4d21-bf86-756b43902d72	DISCOUNT	-3000.00	Discount	Admin	2026-03-15 14:54:56.943678+00
efee5baa-9d4a-4989-97ad-d3c02686ef32	6f493d44-4fcc-4d21-bf86-756b43902d72	DISCOUNT	-200.00	holiday	Admin	2026-03-15 15:06:58.377518+00
bb174ab5-1ec5-4540-9ae5-ff93c129b88c	6f493d44-4fcc-4d21-bf86-756b43902d72	DISCOUNT	-300.00	No reason	Admin	2026-03-15 15:09:00.991679+00
f1081303-fc21-4ad9-accc-371fab946f24	52f1fddb-0c35-476f-8992-07057b6bdb05	DISCOUNT	-4000.00	Family	Admin	2026-03-24 05:50:02.927577+00
ca9b0d31-9181-4963-a13b-1ffd1fa5e31e	5d876882-9c57-42ce-8584-6ee16bcc9c7a	DISCOUNT	-4000.00	Family	Admin	2026-03-24 06:11:37.174625+00
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payments (id, ledger_id, student_id, amount, mode, reference, collected_by, created_at) FROM stdin;
083c9a80-fea4-40d3-b781-770ae9b9cabe	6f493d44-4fcc-4d21-bf86-756b43902d72	69aa9466a6e5fcc3f6cc3aeb	5000.00	CASH	\N	Admin	2026-03-15 15:07:06.675865+00
18fa5d4a-2eba-4fcc-8138-7b217cdf06ef	6f493d44-4fcc-4d21-bf86-756b43902d72	69aa9466a6e5fcc3f6cc3aeb	4000.00	CASH	\N	Admin	2026-03-15 15:09:12.877087+00
669172ab-1344-4ffa-9e97-beb11c442215	5d876882-9c57-42ce-8584-6ee16bcc9c7a	69c10aba37e8b4bdcf78e09f	5000.00	CASH	\N	Admin	2026-03-24 05:45:43.889742+00
67df485b-318c-445f-844f-9046c1575454	52f1fddb-0c35-476f-8992-07057b6bdb05	69c1147837e8b4bdcf78e0a1	5000.00	CASH	\N	Admin	2026-03-24 05:49:49.821871+00
da65d651-9270-4a7c-a217-8fe11a11115c	52f1fddb-0c35-476f-8992-07057b6bdb05	69c1147837e8b4bdcf78e0a1	6000.00	CASH	\N	Admin	2026-03-24 05:50:13.114784+00
2a39ee2d-ac1f-48bf-abc9-3bffa163a906	52f1fddb-0c35-476f-8992-07057b6bdb05	69c1147837e8b4bdcf78e0a1	7000.00	CASH	\N	Admin	2026-03-24 05:50:24.925987+00
6ea0c35a-4654-49f8-90da-7de64cfe6e88	52f1fddb-0c35-476f-8992-07057b6bdb05	69c1147837e8b4bdcf78e0a1	9000.00	CASH	\N	Admin	2026-03-24 05:50:35.220626+00
fc43d186-69b5-4578-9031-82a6f30f2b9d	52f1fddb-0c35-476f-8992-07057b6bdb05	69c1147837e8b4bdcf78e0a1	500.00	CASH	\N	Admin	2026-03-24 05:50:45.672872+00
745ef6a2-525e-404c-9c9b-3acdc7381b10	5d876882-9c57-42ce-8584-6ee16bcc9c7a	69c10aba37e8b4bdcf78e09f	10000.00	CASH	\N	Admin	2026-03-24 06:11:20.159308+00
37a34814-4a47-4854-9601-82780623c620	5d876882-9c57-42ce-8584-6ee16bcc9c7a	69c10aba37e8b4bdcf78e09f	12500.00	CASH	\N	Admin	2026-03-24 06:11:51.761382+00
c805be9b-f2ab-47ab-8f84-b7826a82c9f2	ea3dcb10-0850-4932-adb0-7e37b249ff83	69c1154437e8b4bdcf78e0a3	20000.00	UPI	\N	Admin	2026-03-24 08:57:54.420627+00
\.


--
-- Data for Name: playing_with_neon; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.playing_with_neon (id, name, value) FROM stdin;
1	c4ca4238a0	0.80067754
2	c81e728d9d	0.72183037
3	eccbc87e4b	0.83138317
4	a87ff679a2	0.30155814
5	e4da3b7fbb	0.28823397
6	1679091c5a	0.43687868
7	8f14e45fce	0.45158994
8	c9f0f895fb	0.48604724
9	45c48cce2e	0.037300423
10	d3d9446802	0.6012677
\.


--
-- Data for Name: student_fee_ledgers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.student_fee_ledgers (id, student_id, class_id, academic_session_id, base_components, created_at) FROM stdin;
6f493d44-4fcc-4d21-bf86-756b43902d72	69aa9466a6e5fcc3f6cc3aeb	69875a31b4e12b16d2c16843	4c18f13d-aea9-47fc-8b54-62be6bff6de1	[{"name": "Tuition", "amount": 20000}]	2026-03-15 14:50:53.032968+00
5d876882-9c57-42ce-8584-6ee16bcc9c7a	69c10aba37e8b4bdcf78e09f	69bfa98cd3a98fea31874151	4c18f13d-aea9-47fc-8b54-62be6bff6de1	[{"name": "tution", "amount": 30000}, {"name": "sports", "amount": 1000}, {"name": "uniform", "amount": 500}]	2026-03-24 05:42:26.613286+00
52f1fddb-0c35-476f-8992-07057b6bdb05	69c1147837e8b4bdcf78e0a1	69bfa98cd3a98fea31874151	4c18f13d-aea9-47fc-8b54-62be6bff6de1	[{"name": "tution", "amount": 30000}, {"name": "sports", "amount": 1000}, {"name": "uniform", "amount": 500}]	2026-03-24 05:43:38.107491+00
ea3dcb10-0850-4932-adb0-7e37b249ff83	69c1154437e8b4bdcf78e0a3	69bfa98cd3a98fea31874151	4c18f13d-aea9-47fc-8b54-62be6bff6de1	[{"name": "tution", "amount": 30000}, {"name": "sports", "amount": 1000}, {"name": "uniform", "amount": 500}]	2026-03-24 08:57:24.091239+00
\.


--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.playing_with_neon_id_seq', 10, true);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: academic_sessions academic_sessions_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.academic_sessions
    ADD CONSTRAINT academic_sessions_name_key UNIQUE (name);


--
-- Name: academic_sessions academic_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.academic_sessions
    ADD CONSTRAINT academic_sessions_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: fee_structures fee_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_pkey PRIMARY KEY (id);


--
-- Name: financial_audits financial_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financial_audits
    ADD CONSTRAINT financial_audits_pkey PRIMARY KEY (id);


--
-- Name: ledger_adjustments ledger_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ledger_adjustments
    ADD CONSTRAINT ledger_adjustments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: playing_with_neon playing_with_neon_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playing_with_neon
    ADD CONSTRAINT playing_with_neon_pkey PRIMARY KEY (id);


--
-- Name: student_fee_ledgers student_fee_ledgers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_fee_ledgers
    ADD CONSTRAINT student_fee_ledgers_pkey PRIMARY KEY (id);


--
-- Name: student_fee_ledgers uq_ledger_student_year; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_fee_ledgers
    ADD CONSTRAINT uq_ledger_student_year UNIQUE (student_id, academic_session_id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- Name: idx_academic_sessions_dates; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_academic_sessions_dates ON public.academic_sessions USING btree (start_date, end_date);


--
-- Name: idx_adjustments_ledger; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_adjustments_ledger ON public.ledger_adjustments USING btree (ledger_id);


--
-- Name: idx_adjustments_ledger_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_adjustments_ledger_id ON public.ledger_adjustments USING btree (ledger_id);


--
-- Name: idx_expenses_category; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);


--
-- Name: idx_expenses_expense_date; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_expenses_expense_date ON public.expenses USING btree (expense_date);


--
-- Name: idx_fee_structures_class_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fee_structures_class_id ON public.fee_structures USING btree (class_id);


--
-- Name: idx_fee_structures_session; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fee_structures_session ON public.fee_structures USING btree (academic_session_id);


--
-- Name: idx_fee_structures_session_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fee_structures_session_id ON public.fee_structures USING btree (academic_session_id);


--
-- Name: idx_financial_audits_entity; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_financial_audits_entity ON public.financial_audits USING btree (entity_type, entity_id);


--
-- Name: idx_financial_audits_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_financial_audits_user ON public.financial_audits USING btree (performed_by);


--
-- Name: idx_ledger_summary_year; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_ledger_summary_year ON public.student_fee_ledgers USING btree (academic_session_id);


--
-- Name: idx_ledgers_session; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_ledgers_session ON public.student_fee_ledgers USING btree (academic_session_id);


--
-- Name: idx_ledgers_session_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_ledgers_session_id ON public.student_fee_ledgers USING btree (academic_session_id);


--
-- Name: idx_ledgers_student_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_ledgers_student_id ON public.student_fee_ledgers USING btree (student_id);


--
-- Name: idx_payments_ledger; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_payments_ledger ON public.payments USING btree (ledger_id);


--
-- Name: idx_payments_ledger_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_payments_ledger_id ON public.payments USING btree (ledger_id);


--
-- Name: idx_payments_student; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_payments_student ON public.payments USING btree (student_id);


--
-- Name: idx_payments_student_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_payments_student_id ON public.payments USING btree (student_id);


--
-- Name: idx_student_fee_ledgers_session; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_student_fee_ledgers_session ON public.student_fee_ledgers USING btree (academic_session_id);


--
-- Name: uq_active_fee_structure; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX uq_active_fee_structure ON public.fee_structures USING btree (class_id, academic_session_id) WHERE (status = 'ACTIVE'::text);


--
-- Name: student_fee_ledgers lock_base_components_after_payment; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER lock_base_components_after_payment BEFORE UPDATE OF base_components ON public.student_fee_ledgers FOR EACH ROW EXECUTE FUNCTION public.trg_lock_base_components();


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: fee_structures fee_structures_academic_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_academic_session_id_fkey FOREIGN KEY (academic_session_id) REFERENCES public.academic_sessions(id) ON DELETE RESTRICT;


--
-- Name: ledger_adjustments ledger_adjustments_ledger_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ledger_adjustments
    ADD CONSTRAINT ledger_adjustments_ledger_id_fkey FOREIGN KEY (ledger_id) REFERENCES public.student_fee_ledgers(id) ON DELETE RESTRICT;


--
-- Name: payments payments_ledger_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_ledger_id_fkey FOREIGN KEY (ledger_id) REFERENCES public.student_fee_ledgers(id) ON DELETE RESTRICT;


--
-- Name: student_fee_ledgers student_fee_ledgers_academic_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.student_fee_ledgers
    ADD CONSTRAINT student_fee_ledgers_academic_session_id_fkey FOREIGN KEY (academic_session_id) REFERENCES public.academic_sessions(id) ON DELETE RESTRICT;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- Name: finance_monthly_summary; Type: MATERIALIZED VIEW DATA; Schema: public; Owner: neondb_owner
--

REFRESH MATERIALIZED VIEW public.finance_monthly_summary;


--
-- PostgreSQL database dump complete
--

\unrestrict XkmUBc8NJfeFxobzfzALyfOZxce6MKFwwPeR1lRuhYz2UHjU8Be6PG3LiLwDyhK

