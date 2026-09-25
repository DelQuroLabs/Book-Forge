import { StoryMemory } from "./StoryMemory";
import {
  WritingTools,
  ManuscriptSearch,
  DeviceRecoveryPanel,
  revealTextSelection,
} from "./WritingTools";
import { useDeviceRecovery } from "./useDeviceRecovery";
import {
  retainNewerEdits,
  canRestoreWhole,
  recoveredChapter,
  type ManuscriptHit,
  type RecoveryRecord,
} from "../shared/writing";
import type { DeviceCopy } from "./deviceDrafts";
import { SeriesRoadmapEditor } from "./SeriesRoadmap";
import {
  roadmapFor,
  volumeHasRoadmapReferences,
} from "../shared/series-planning";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  Ghost,
  Library,
  Layers3,
  Dices,
  Settings2,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Search,
  BookOpen,
  Feather,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  X,
  LockKeyhole,
  Unlock,
  Globe2,
  MapPin,
  Users,
  ScrollText,
  Activity,
  Download,
  Upload,
  Save,
  Trash2,
  RotateCcw,
  Play,
  Pause,
  Square,
  Menu,
  Info,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Link2,
  GitBranch,
  LoaderCircle,
  LogOut,
} from "lucide-react";
import {
  GENRES,
  cultureProfiles,
  forge,
  suggestName,
  newBook,
  newSeries,
  chapterTemplate,
  uuid,
  bookWords,
  words,
  type Book,
  type Series,
  type Concept,
  type Character,
  type Job,
  type Settings,
} from "../shared/domain";

import {
  PlacePicker,
  NamingSuggestions,
  CultureOptions,
} from "./NamingControls";
import { placeStats } from "../shared/places";

let unsaved = false;
function go(path: string) {
  if (
    unsaved &&
    !confirm("You have unsaved changes. Leave this page without saving them?")
  )
    return;
  unsaved = false;
  location.hash = path;
}
async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const r = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json", "X-Ghost-Writer": "1" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Request failed.");
  return j;
}
function useDirty(dirty: boolean) {
  useEffect(() => {
    unsaved = dirty;
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => {
      window.removeEventListener("beforeunload", h);
      unsaved = false;
    };
  }, [dirty]);
}
const IconButton = ({
  label,
  children,
  onClick,
  className = "",
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    className={"icon-button " + className}
    title={label}
    aria-label={label}
    onClick={onClick}
  >
    {children}
  </button>
);
const Field = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {hint && <small>{hint}</small>}
  </label>
);
const Badge = ({
  children,
  good = false,
}: {
  children: ReactNode;
  good?: boolean;
}) => <span className={"badge " + (good ? "good" : "")}>{children}</span>;
const Empty = ({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) => (
  <div className="empty">
    <BookOpen size={36} />
    <h3>{title}</h3>
    <p>{text}</p>
    {children}
  </div>
);
function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const el = document.querySelector('[role="dialog"]');
        const a = Array.from(
          el?.querySelectorAll<HTMLElement>(
            "button,input,select,textarea,a[href],summary,[tabindex]",
          ) || [],
        ).filter(
          (e) =>
            !e.hasAttribute("disabled") &&
            e.tabIndex >= 0 &&
            e.getClientRects().length > 0 &&
            (!e.closest("details:not([open])") ||
              e ===
                e
                  .closest("details:not([open])")
                  ?.querySelector(":scope > summary")),
        );
        if (a.length) {
          if (e.shiftKey && document.activeElement === a[0]) {
            e.preventDefault();
            a[a.length - 1].focus();
          } else if (
            !e.shiftKey &&
            document.activeElement === a[a.length - 1]
          ) {
            e.preventDefault();
            a[0].focus();
          }
        }
      }
    };
    document.addEventListener("keydown", h);
    const old = document.activeElement as HTMLElement;
    const focusTimer = setTimeout(
      () =>
        (
          document.querySelector<HTMLElement>(
            '[role="dialog"] [data-autofocus]',
          ) || document.querySelector<HTMLElement>('[role="dialog"] button')
        )?.focus(),
      20,
    );
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", h);
      old?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal"
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <IconButton label="Close dialog" onClick={close}>
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}
function Cover({ book, small = false }: { book: Book; small?: boolean }) {
  return (
    <div className={`cover color-${book.color} ${small ? "cover-small" : ""}`}>
      <div className="cover-grain" />
      <span className="cover-edition">
        {book.seriesId
          ? "A NOVEL IN A WORLD OF YOUR MAKING"
          : "A GHOST WRITER MANUSCRIPT"}
      </span>
      <div className="cover-title">{book.title}</div>
      <svg
        className="cover-art"
        viewBox="0 0 240 175"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M36 169V87a84 84 0 0 1 168 0v82M51 169V87a69 69 0 0 1 138 0v82M66 169V87a54 54 0 0 1 108 0v82M81 169V87a39 39 0 0 1 78 0v82"
          stroke="currentColor"
          strokeWidth=".6"
        />
        <circle cx="120" cy="78" r="25" fill="currentColor" opacity=".14" />
        <path
          d="M120 42v75M83 79h74M94 52l52 54M94 106l52-54"
          stroke="currentColor"
          strokeWidth=".65"
        />
        <path
          d="M16 167h208M25 158h190M48 149h144"
          stroke="currentColor"
          opacity=".45"
        />
        <circle cx="120" cy="79" r="6" stroke="currentColor" />
      </svg>
      <span className="cover-genre">{book.genre.toUpperCase()}</span>
    </div>
  );
}
type Data = { books: Book[]; series: Series[]; jobs: Job[] };
type Notice = (text: string) => void;
export default function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/library");
  const [auth, setAuth] = useState<boolean | null>(null);
  const [data, setData] = useState<Data>({ books: [], series: [], jobs: [] });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [mobile, setMobile] = useState(false);
  const notice = useCallback((t: string) => {
    setMessage(t);
  }, []);
  const refresh = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([
        api<Data>("/library"),
        api<Settings>("/settings"),
      ]);
      setData(d);
      setSettings(s);
      setLoadError("");
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    api<{ authenticated: boolean }>("/auth")
      .then((a) => setAuth(a.authenticated))
      .catch((e) => setLoadError(e.message));
    const h = () => {
      setRoute(location.hash.slice(1) || "/library");
      setMobile(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  useEffect(() => {
    if (!auth) return;
    void refresh();
    const t = setInterval(() => void refresh(), 5000);
    return () => clearInterval(t);
  }, [auth, refresh]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 7000);
    return () => clearTimeout(t);
  }, [message]);
  if (auth === null)
    return (
      <div className="boot">
        <Ghost size={36} />
        <h2>Opening your writing studio</h2>
        {loadError ? (
          <>
            <p>{loadError}</p>
            <button onClick={() => location.reload()}>Retry</button>
          </>
        ) : (
          <LoaderCircle className="spin" />
        )}
      </div>
    );
  if (!auth) return <Login onLogin={() => setAuth(true)} />;
  const parts = route.split("/").filter(Boolean),
    page = parts[0] || "library";
  const nav = [
    { path: "library", label: "Your library", icon: Library },
    { path: "forge", label: "Story forge", icon: Dices },
    { path: "series", label: "Series studio", icon: Layers3 },
    { path: "jobs", label: "Writing activity", icon: Activity },
  ];
  const b = data.books.find((b) => b.id === parts[1]),
    s = data.series.find((s) => s.id === parts[1]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <button className="brand" onClick={() => go("/library")}>
          <span className="brand-icon">
            <Ghost size={24} />
          </span>
          <span>
            Ghost Writer<small>THE AUTHOR’S STUDIO</small>
          </span>
        </button>
        <div className="workspace-label">
          <span className="avatar-mini">D</span>
          <div>
            My writing space<small>Private workspace</small>
          </div>
          <LockKeyhole size={13} />
        </div>
        <span className="nav-heading">WORKSPACE</span>
        <nav>
          {nav.map((n) => (
            <button
              key={n.path}
              onClick={() => go("/" + n.path)}
              className={
                page === n.path || (page === "book" && n.path === "library")
                  ? "active"
                  : ""
              }
            >
              <n.icon size={18} />
              {n.label}
              {n.path === "library" && (
                <span className="nav-count">{data.books.length}</span>
              )}
              {n.path === "jobs" &&
                data.jobs.some((j) => j.status === "running") && (
                  <i className="status-dot" />
                )}
            </button>
          ))}
        </nav>
        <div className="sidebar-projects">
          <span className="nav-heading">YOUR SERIES</span>
          {data.series.slice(0, 4).map((s) => (
            <button key={s.id} onClick={() => go("/series/" + s.id)}>
              <span className="series-dot" />
              {s.title}
            </button>
          ))}
          <button className="subtle" onClick={() => go("/series")}>
            <Plus size={14} />
            Plan a new series
          </button>
        </div>
        <div className="sidebar-bottom">
          <div className="private-card">
            <ShieldCheck size={18} />
            <div>
              Your words. Your world.
              <p>
                {settings?.demo
                  ? "Synthetic preview · no API spend"
                  : "Private, self-hosted writing studio"}
              </p>
            </div>
          </div>
          <button
            className={page === "settings" ? "active" : ""}
            onClick={() => go("/settings")}
          >
            <Settings2 size={18} />
            Studio settings
          </button>
          <div className="account">
            <span className="avatar">D</span>
            <div>
              My author desk
              <small>
                {settings?.demo ? "Preview workspace" : "Private author"}
              </small>
            </div>
            {!settings?.demo && (
              <IconButton
                label="Sign out"
                onClick={() => {
                  if (unsaved && !confirm("Leave unsaved edits and sign out?"))
                    return;
                  api("/logout", "POST", {}).then(() => setAuth(false));
                }}
              >
                <LogOut size={16} />
              </IconButton>
            )}
          </div>
        </div>
      </aside>
      {mobile && (
        <div className="sidebar-scrim" onClick={() => setMobile(false)} />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <IconButton
              label="Toggle navigation"
              className="mobile-menu"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </IconButton>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {page === "book"
                ? "Manuscript"
                : page === "forge"
                  ? "Story forge"
                  : page === "series"
                    ? "Series studio"
                    : page === "jobs"
                      ? "Writing activity"
                      : page === "settings"
                        ? "Studio settings"
                        : "Your library"}
            </strong>
          </div>
          <div className="topbar-right">
            <button className="connection" onClick={() => go("/settings")}>
              <i
                className={"status-dot " + (!settings?.ready ? "muted" : "")}
              />
              {settings?.ready
                ? "OpenAI connected"
                : settings?.demo
                  ? "Local preview"
                  : "Connect OpenAI"}
            </button>
            <span className="divider" />
            <span className="avatar-small">D</span>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className={page === "book" ? "book-main" : "content"}
        >
          {loadError && (
            <div className="notice error">
              <AlertTriangle size={18} />
              {loadError}
              <button onClick={() => void refresh()}>Retry</button>
            </div>
          )}
          {page === "library" && (
            <LibraryPage data={data} refresh={refresh} notice={notice} />
          )}
          {page === "forge" && (
            <ForgePage data={data} refresh={refresh} notice={notice} />
          )}
          {page === "series" && !parts[1] && (
            <SeriesList data={data} refresh={refresh} notice={notice} />
          )}
          {page === "series" &&
            parts[1] &&
            (s ? (
              <SeriesEditor
                key={s.id}
                series={s}
                data={data}
                refresh={refresh}
                notice={notice}
              />
            ) : (
              <Empty
                title="Series not found"
                text="Return to the series studio to choose a project."
              >
                <button onClick={() => go("/series")}>Series studio</button>
              </Empty>
            ))}
          {page === "book" &&
            (b ? (
              <BookEditor
                key={b.id}
                book={b}
                data={data}
                settings={settings}
                refresh={refresh}
                notice={notice}
              />
            ) : (
              <Empty
                title="Opening manuscript"
                text="If this book was removed, return to your library."
              >
                <button onClick={() => go("/library")}>Your library</button>
              </Empty>
            ))}
          {page === "jobs" && (
            <ActivityPage data={data} refresh={refresh} notice={notice} />
          )}
          {page === "settings" && (
            <SettingsPage
              settings={settings}
              data={data}
              refresh={refresh}
              notice={notice}
            />
          )}
          {!["library", "forge", "series", "book", "jobs", "settings"].includes(
            page,
          ) && (
            <Empty
              title="A page yet to be written"
              text="This part of the studio does not exist."
            >
              <button onClick={() => go("/library")}>Back to library</button>
            </Empty>
          )}
        </main>
        <footer className="app-footer">
          <Ghost size={14} />
          Made for the stories only you can tell.
          <span>Ghost Writer / Private edition</span>
        </footer>
      </div>
      {message && (
        <div className="toast" role="status">
          <Info size={18} />
          <span>{message}</span>
          <IconButton
            label="Dismiss notification"
            onClick={() => setMessage("")}
          >
            <X size={16} />
          </IconButton>
        </div>
      )}
    </div>
  );
}
function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="login">
      <div className="login-mark">
        <Ghost size={32} />
      </div>
      <h1>
        A quiet place for
        <br />
        your next great story.
      </h1>
      <p>Welcome to your private Ghost Writer studio.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api("/login", "POST", { password });
            onLogin();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Studio password">
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {busy ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <ArrowRight size={18} />
          )}
          Enter your studio
        </button>
      </form>
      <small>Self-hosted. Your library stays on your server.</small>
    </div>
  );
}
function PageHeading({
  eyebrow,
  title,
  desc,
  children,
}: {
  eyebrow?: string;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
function LibraryPage({
  data,
  refresh,
  notice,
}: {
  data: Data;
  refresh: () => Promise<void>;
  notice: Notice;
}) {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all");
  const total = data.books.reduce((s, b) => s + bookWords(b), 0);
  const books = data.books.filter(
    (b) =>
      (filter !== "drafts" || bookWords(b) > 0) &&
      (filter !== "planned" || !bookWords(b)) &&
      `${b.title} ${b.genre}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE IMAGINATION. A WHOLE NEW WORLD."
        title="Your next chapter starts here."
        desc="A home for your ideas, your worlds, and the books they become."
      >
        <button className="primary" onClick={() => go("/forge")}>
          <Plus size={18} />
          Create a book
        </button>
      </PageHeading>
      <section className="inspiration-banner">
        <div className="banner-copy">
          <span className="eyebrow">
            <Sparkles size={13} />
            MEET YOUR NEXT STORY
          </span>
          <h2>
            What if your best idea
            <br />
            is one roll away?
          </h2>
          <p>
            Discover a connected premise, a compelling character,
            <br className="desktop-break" />
            and a world that makes sense. Keep what speaks to you.
          </p>
          <button onClick={() => go("/forge")}>
            Enter the story forge
            <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="banner-visual" aria-hidden="true">
          <div className="orbit orbit1" />
          <div className="orbit orbit2" />
          <div className="orbit orbit3" />
          <div className="dice-object">
            <Dices size={63} strokeWidth={0.9} />
          </div>
          <span className="floating-pill pill-one">
            <Globe2 size={13} />A world worth exploring
          </span>
          <span className="floating-pill pill-two">
            <GitBranch size={13} />
            Every choice connected
          </span>
          <span className="star star1">✧</span>
          <span className="star star2">✦</span>
        </div>
      </section>
      <div className="stats-row">
        <div>
          <span className="stat-icon">
            <BookOpen size={18} />
          </span>
          <div>
            <strong>{data.books.length}</strong>
            <span>Books in your library</span>
          </div>
        </div>
        <div>
          <span className="stat-icon">
            <Feather size={18} />
          </span>
          <div>
            <strong>{total.toLocaleString()}</strong>
            <span>Words on the page</span>
          </div>
        </div>
        <div>
          <span className="stat-icon">
            <Layers3 size={18} />
          </span>
          <div>
            <strong>{data.series.length}</strong>
            <span>Worlds in the making</span>
          </div>
        </div>
      </div>
      <section>
        <div className="section-toolbar">
          <div className="tabs">
            {[
              ["all", "All books"],
              ["drafts", "In progress"],
              ["planned", "Planning"],
            ].map(([id, name]) => (
              <button
                className={filter === id ? "selected" : ""}
                key={id}
                onClick={() => setFilter(id)}
              >
                {name}
                {id === "all" && <span>{data.books.length}</span>}
              </button>
            ))}
          </div>
          <label className="search">
            <Search size={16} />
            <input
              aria-label="Search your library"
              placeholder="Find a story…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="book-grid">
          {books.map((b) => (
            <article className="book-card" key={b.id}>
              <button
                className="cover-link"
                onClick={() => go("/book/" + b.id)}
                aria-label={"Open " + b.title}
              >
                <Cover book={b} />
                <span className="cover-open">
                  Open manuscript
                  <ArrowUpRight size={17} />
                </span>
              </button>
              <div className="book-card-meta">
                <div className="book-label-row">
                  <span className="genre-label">{b.genre}</span>
                  {b.sample && <span className="sample-label">SAMPLE</span>}
                  <IconButton
                    label={"Delete " + b.title}
                    onClick={async () => {
                      if (
                        !confirm(
                          `Delete “${b.title}” and its saved revisions? Export a backup first. This cannot be undone.`,
                        )
                      )
                        return;
                      try {
                        await api("/books/" + b.id, "DELETE");
                        await refresh();
                        notice("Book deleted.");
                      } catch (e) {
                        notice((e as Error).message);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </div>
                <button
                  className="book-title-link"
                  onClick={() => go("/book/" + b.id)}
                >
                  {b.title}
                </button>
                <div className="book-subline">
                  {b.seriesId
                    ? data.series.find((s) => s.id === b.seriesId)?.title
                    : "Standalone novel"}
                </div>
                <div className="book-progress">
                  <i
                    style={{
                      width:
                        Math.min(100, (bookWords(b) / b.targetWords) * 100) +
                        "%",
                    }}
                  />
                </div>
                <div className="book-card-foot">
                  <span>
                    <i
                      className={"status-dot " + (!bookWords(b) ? "amber" : "")}
                    />
                    {bookWords(b) ? "Drafting" : "Planning"}
                  </span>
                  <span>
                    {bookWords(b).toLocaleString()} /{" "}
                    {(b.targetWords / 1000).toFixed(0)}k words
                  </span>
                </div>
              </div>
            </article>
          ))}
          {!query && filter === "all" && (
            <button className="new-book-card" onClick={() => go("/forge")}>
              <span>
                <Plus size={25} />
              </span>
              <h3>
                A story waiting
                <br />
                to be written.
              </h3>
              <p>
                Start with an idea.
                <br />
                Or let the dice find one.
              </p>
              <div>
                Create a book
                <ArrowRight size={15} />
              </div>
            </button>
          )}
        </div>
        {!books.length && (
          <Empty
            title="No stories here yet"
            text={
              query
                ? "Try another title or genre."
                : "Start a book in the story forge and make it yours."
            }
          />
        )}
      </section>
      <div className="library-bottom">
        <div>
          <Layers3 size={23} />
          <div>
            <h3>Think beyond one book.</h3>
            <p>
              Build a series with shared canon, connected arcs, and earned
              payoffs.
            </p>
          </div>
        </div>
        <button className="text-button" onClick={() => go("/series")}>
          Open series studio
          <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}
const defaultForge = {
  seed: "",
  genre: "LitRPG" as (typeof GENRES)[number],
  culture: "ja",
  location: "Kyoto, Japan",
  era: "Contemporary",
};
function ForgePage({
  data,
  refresh,
  notice,
}: {
  data: Data;
  refresh: () => Promise<void>;
  notice: Notice;
}) {
  const [inputs, setInputs] = useState({ ...defaultForge, seed: "new-story" });
  const [concept, setConcept] = useState<Concept>(() =>
    forge({ ...defaultForge, seed: "new-story" }),
  );
  const [locks, setLocks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [seriesId, setSeriesId] = useState("");
  const [volumeId, setVolumeId] = useState("");
  const series = data.series.find((s) => s.id === seriesId);
  const profile = cultureProfiles.find((p) => p.id === inputs.culture)!;
  const roll = (replay = false) => {
    try {
      if (locks.includes("protagonist") && inputs.culture !== concept.culture) {
        throw new Error(
          "Unlock the protagonist before changing their naming background. You can change the setting without changing their cultural identity.",
        );
      }
      const seed = replay ? inputs.seed : uuid();
      const next = forge({
        ...inputs,
        seed,
        locked: Object.fromEntries(
          locks.map((k) => [k, concept[k as keyof Concept]]),
        ),
      });
      setInputs({ ...inputs, seed });
      setConcept(next);
    } catch (e) {
      notice((e as Error).message);
    }
  };
  const lock = (key: string) =>
    setLocks(
      locks.includes(key) ? locks.filter((k) => k !== key) : [...locks, key],
    );
  async function create() {
    setBusy(true);
    try {
      let b = newBook(concept, seriesId || null, volumeId || null);
      if (series) {
        const v = series.volumes.find((v) => v.id === volumeId);
        if (!v) throw new Error("Choose a series volume.");
        b = {
          ...b,
          title: v.title,
          bible:
            series.canon + "\n\nVOLUME ARC\n" + v.arc + "\nENDING\n" + v.ending,
          premise: v.arc,
          characters: series.characters,
          location: series.location,
          culture: series.culture,
          era: series.era,
        };
      }
      const saved = await api<Book>("/books", "POST", b);
      await refresh();
      go("/book/" + saved.id);
      notice("Your story has a home. Start with the bible and outline.");
    } catch (e) {
      notice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="A SPARK, WITH STRUCTURE"
        title="The story forge"
        desc="Roll a coherent direction. Lock what you love. Make the rest your own."
      >
        <Badge good>
          <Dices size={12} />
          Local generation · no API cost
        </Badge>
      </PageHeading>
      <div className="forge-layout">
        <section className="panel forge-controls">
          <div className="panel-title">
            <Settings2 size={18} />
            <h3>Shape the possibility</h3>
          </div>
          <Field label="Genre">
            <select
              value={inputs.genre}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  genre: e.target.value as (typeof GENRES)[number],
                })
              }
            >
              {GENRES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Character naming background"
            hint="A character’s background—not everyone’s identity in this location."
          >
            <select
              value={inputs.culture}
              onChange={(e) => {
                const p = cultureProfiles.find((p) => p.id === e.target.value)!;
                setInputs({ ...inputs, culture: p.id });
              }}
            >
              <CultureOptions />
            </select>
          </Field>
          <Field label="Story location">
            <input
              value={inputs.location}
              onChange={(e) =>
                setInputs({ ...inputs, location: e.target.value })
              }
            />
          </Field>
          <PlacePicker
            value={inputs.location}
            onChange={(location) => setInputs({ ...inputs, location })}
          />
          <NamingSuggestions
            location={inputs.location}
            culture={inputs.culture}
            onSelect={(culture) => setInputs({ ...inputs, culture })}
          />
          <Field label="Era">
            <select
              value={inputs.era}
              onChange={(e) => setInputs({ ...inputs, era: e.target.value })}
            >
              {[
                "Contemporary",
                "Near future",
                "Post-system",
                "Historical (manual names required)",
              ].map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </Field>
          <div className="naming-note">
            <Globe2 size={17} />
            <p>{profile.note}</p>
          </div>
          <Field label="Replay seed">
            <div className="input-action">
              <input
                value={inputs.seed}
                onChange={(e) => setInputs({ ...inputs, seed: e.target.value })}
              />
              <IconButton label="Replay this seed" onClick={() => roll(true)}>
                <RotateCcw size={16} />
              </IconButton>
            </div>
          </Field>
          <button className="primary wide" onClick={() => roll()}>
            <Dices size={18} />
            Reroll unlocked
          </button>
          <p className="microcopy">
            {placeStats.countries} countries · {placeStats.regions} regions ·{" "}
            {placeStats.cities} city entries · {cultureProfiles.length - 1}{" "}
            real-world naming profiles + custom.
          </p>
          <p className="microcopy">
            Settings take effect on the next roll. Starter catalog v1 ·
            combination count not certified.
          </p>
        </section>
        <div className="forge-result">
          <div className="concept-heading">
            <Badge>{concept.genre}</Badge>
            <span>
              <MapPin size={13} />
              {concept.location}
            </span>
            <span className="seed-chip">SEED {concept.seed.slice(0, 12)}</span>
          </div>
          <section className="concept-card">
            <div className="lock-row">
              <span className="eyebrow">YOUR NEXT POSSIBILITY</span>
              <IconButton
                label={locks.includes("title") ? "Unlock title" : "Lock title"}
                onClick={() => lock("title")}
              >
                {locks.includes("title") ? (
                  <LockKeyhole size={17} />
                ) : (
                  <Unlock size={17} />
                )}
              </IconButton>
            </div>
            <input
              className="concept-title-input"
              aria-label="Concept title"
              value={concept.title}
              onChange={(e) =>
                setConcept({ ...concept, title: e.target.value })
              }
            />
            <textarea
              className="concept-premise"
              aria-label="Premise"
              value={concept.premise}
              rows={4}
              onChange={(e) =>
                setConcept({ ...concept, premise: e.target.value })
              }
            />
            <div className="concept-grid">
              <div>
                <span className="label-icon">
                  <Users size={14} />
                  PROTAGONIST
                  <IconButton
                    label={
                      locks.includes("protagonist")
                        ? "Unlock protagonist"
                        : "Lock protagonist"
                    }
                    onClick={() => lock("protagonist")}
                  >
                    {locks.includes("protagonist") ? (
                      <LockKeyhole size={13} />
                    ) : (
                      <Unlock size={13} />
                    )}
                  </IconButton>
                </span>
                <input
                  aria-label="Protagonist name"
                  value={concept.protagonist}
                  onChange={(e) => {
                    const old = concept.protagonist;
                    setConcept({
                      ...concept,
                      protagonist: e.target.value,
                      premise: concept.premise.replace(old, e.target.value),
                    });
                  }}
                />
                <p>{concept.role}</p>
              </div>
              <div>
                <span className="label-icon">
                  <Feather size={14} />
                  TONE
                  <IconButton
                    label={locks.includes("tone") ? "Unlock tone" : "Lock tone"}
                    onClick={() => lock("tone")}
                  >
                    {locks.includes("tone") ? (
                      <LockKeyhole size={13} />
                    ) : (
                      <Unlock size={13} />
                    )}
                  </IconButton>
                </span>
                <input
                  aria-label="Story tone"
                  value={concept.tone}
                  onChange={(e) =>
                    setConcept({ ...concept, tone: e.target.value })
                  }
                />
                <p>Your voice, not an imitation.</p>
              </div>
              <div>
                <span className="label-icon">
                  <GitBranch size={14} />
                  THE CONFLICT
                </span>
                <p className="concept-detail">{concept.opposition}</p>
              </div>
              <div>
                <span className="label-icon">
                  <Clock size={14} />
                  WHAT’S AT STAKE
                </span>
                <p className="concept-detail">{concept.stakes}</p>
              </div>
            </div>
            <div className="system-block">
              <ScrollText size={18} />
              <div>
                <h4>
                  {concept.genre === "LitRPG"
                    ? "The system has rules"
                    : "Rules of this world"}
                </h4>
                <p>{concept.system}</p>
              </div>
            </div>
          </section>
          <div className="coherence">
            <CheckCircle2 size={19} />
            <div>
              <strong>Connected by design</strong>
              <p>
                {concept.explanation} This is a curated starting point, not a
                guarantee of cultural or historical accuracy.
              </p>
            </div>
          </div>
          <section className="panel creation-bar">
            <div className="two-fields">
              <Field label="Book belongs to">
                <select
                  value={seriesId}
                  onChange={(e) => {
                    setSeriesId(e.target.value);
                    setVolumeId("");
                  }}
                >
                  <option value="">Standalone book</option>
                  {data.series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </Field>
              {series && (
                <Field label="Volume">
                  <select
                    value={volumeId}
                    onChange={(e) => setVolumeId(e.target.value)}
                  >
                    <option value="">Choose a volume</option>
                    {series.volumes
                      .filter(
                        (v) => !data.books.some((b) => b.volumeId === v.id),
                      )
                      .map((v, i) => (
                        <option key={v.id} value={v.id}>
                          {i + 1}. {v.title}
                        </option>
                      ))}
                  </select>
                </Field>
              )}
            </div>
            {series && (
              <p className="microcopy">
                Series canon, cast, location and volume arc take precedence when
                creating this manuscript.
              </p>
            )}
            <button
              className="primary"
              onClick={() => void create()}
              disabled={busy || !concept.title.trim()}
            >
              {busy ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <Feather size={17} />
              )}
              Make this my book
              <ArrowRight size={17} />
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
function SeriesList({
  data,
  refresh,
  notice,
}: {
  data: Data;
  refresh: () => Promise<void>;
  notice: Notice;
}) {
  const [open, setOpen] = useState(false),
    [title, setTitle] = useState(""),
    [genre, setGenre] = useState<(typeof GENRES)[number]>("LitRPG"),
    [count, setCount] = useState(3),
    [busy, setBusy] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="ONE WORLD. A LONGER STORY."
        title="Series studio"
        desc="Plan the endgame, book-by-book milestones, character journeys and shared canon in one place."
      >
        <button className="primary" onClick={() => setOpen(true)}>
          <Plus size={18} />
          Plan a series
        </button>
      </PageHeading>
      <div className="series-grid">
        {data.series.map((s) => (
          <article className="series-card" key={s.id}>
            <div className="series-card-art">
              <Layers3 size={38} strokeWidth={1} />
              <span>{s.volumes.length} VOLUMES · SHARED WORLD</span>
              <h2>{s.title}</h2>
              <div className="series-spines">
                {s.volumes.map((v, i) => (
                  <i key={v.id}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </i>
                ))}
              </div>
            </div>
            <div className="series-card-body">
              <Badge>{s.genre}</Badge>
              <p>{s.premise}</p>
              <div className="series-card-stats">
                <span>
                  <Users size={14} />
                  {s.characters.length} recurring characters
                </span>
                <span>
                  <Link2 size={14} />
                  {s.threads.length} story threads
                </span>
              </div>
              <button
                className="secondary wide"
                onClick={() => go("/series/" + s.id)}
              >
                Open series planner
                <ArrowRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!data.series.length && (
        <Empty
          title="A world with room to grow"
          text="Create a series to connect your cast, canon, and volume arcs."
        >
          <button className="primary" onClick={() => setOpen(true)}>
            Plan a series
          </button>
        </Empty>
      )}
      <div className="notice">
        <Info size={18} />
        <span>
          Series canon and approved character names accompany every linked
          book’s AI requests. Changes flag linked manuscripts for a continuity
          review.
        </span>
      </div>
      {open && (
        <Modal title="Begin a new series" close={() => setOpen(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const c = forge({ ...defaultForge, seed: uuid(), genre });
                const s = newSeries(c, count);
                s.title = title;
                s.premise = "";
                s.canon = "";
                s.characters = [];
                s.volumes[0].arc =
                  "Introduce the core cast and primary setting. Establish the series conflict while resolving this book’s immediate goal.";
                const saved = await api<Series>("/series", "POST", s);
                await refresh();
                setOpen(false);
                go("/series/" + saved.id);
              } catch (e) {
                notice((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Series title">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A world worth returning to"
              />
            </Field>
            <div className="two-fields">
              <Field label="Genre">
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as typeof genre)}
                >
                  {GENRES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <Field label="Planned volumes">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              </Field>
            </div>
            <p className="microcopy">
              This creates editable planning cards, not AI-generated prose. Add
              the shared premise and recurring cast next.
            </p>
            <button className="primary wide" disabled={busy}>
              Create series
              <ArrowRight size={16} />
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function CharacterEditor({
  characters,
  onChange,
  defaultCulture,
  defaultLocation,
  defaultEra,
  notice,
}: {
  characters: Character[];
  onChange: (c: Character[]) => void;
  defaultCulture: string;
  defaultLocation: string;
  defaultEra: string;
  notice: Notice;
}) {
  const edit = (id: string, patch: Partial<Character>) =>
    onChange(characters.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  return (
    <div>
      <div className="section-title">
        <div>
          <h3>A cast with roots</h3>
          <p>
            Origin, language and personal history shape naming—not stereotypes.
          </p>
        </div>
        <button
          className="secondary"
          onClick={() =>
            onChange([
              ...characters,
              {
                id: uuid(),
                name: "New character",
                role: "",
                origin: defaultLocation,
                culture: defaultCulture,
                language:
                  cultureProfiles.find((p) => p.id === defaultCulture)
                    ?.language || "",
                era: defaultEra,
                notes: "",
              },
            ])
          }
        >
          <Plus size={16} />
          Add character
        </button>
      </div>
      <div className="character-grid">
        {characters.map((c) => (
          <section className="panel character-card" key={c.id}>
            <div className="character-head">
              <span className="character-avatar">{c.name.slice(0, 1)}</span>
              <div>
                <strong>{c.name}</strong>
                <small>{c.role || "A role to discover"}</small>
              </div>
              <IconButton
                label={"Remove " + c.name}
                onClick={() => {
                  if (
                    confirm(
                      "Remove this character from this cast? Existing manuscript references are not rewritten.",
                    )
                  )
                    onChange(characters.filter((x) => x.id !== c.id));
                }}
              >
                <Trash2 size={15} />
              </IconButton>
            </div>
            <Field label="Full display name">
              <div className="input-action">
                <input
                  value={c.name}
                  onChange={(e) => edit(c.id, { name: e.target.value })}
                />
                <IconButton
                  label={"Suggest culturally relevant name for " + c.name}
                  onClick={() => {
                    try {
                      edit(c.id, {
                        name: suggestName(c.culture, uuid(), c.era),
                      });
                    } catch (e) {
                      notice((e as Error).message);
                    }
                  }}
                >
                  <Dices size={17} />
                </IconButton>
              </div>
            </Field>
            <div className="two-fields">
              <Field label="Role">
                <input
                  value={c.role}
                  onChange={(e) => edit(c.id, { role: e.target.value })}
                />
              </Field>
              <Field label="Origin / hometown">
                <input
                  value={c.origin}
                  onChange={(e) => edit(c.id, { origin: e.target.value })}
                />
              </Field>
            </div>
            <PlacePicker
              value={c.origin}
              onChange={(origin) => edit(c.id, { origin })}
            />
            <NamingSuggestions
              location={c.origin}
              culture={c.culture}
              character
              onSelect={(culture) =>
                edit(c.id, {
                  culture,
                  language: cultureProfiles.find((p) => p.id === culture)!
                    .language,
                })
              }
            />
            <Field label="Naming background">
              <select
                value={c.culture}
                onChange={(e) =>
                  edit(c.id, {
                    culture: e.target.value,
                    language:
                      cultureProfiles.find((p) => p.id === e.target.value)
                        ?.language || c.language,
                  })
                }
              >
                <CultureOptions />
              </select>
            </Field>
            <div className="two-fields">
              <Field label="Language">
                <input
                  value={c.language}
                  onChange={(e) => edit(c.id, { language: e.target.value })}
                />
              </Field>
              <Field label="Era">
                <input
                  value={c.era}
                  onChange={(e) => edit(c.id, { era: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Motivation, relationships & naming notes">
              <textarea
                rows={4}
                value={c.notes}
                onChange={(e) => edit(c.id, { notes: e.target.value })}
              />
            </Field>
            <p className="microcopy">
              {cultureProfiles.find((p) => p.id === c.culture)?.note}
            </p>
          </section>
        ))}
      </div>
      {!characters.length && (
        <Empty
          title="Meet your characters"
          text="Add a recurring character, choose their background, then suggest or write their name."
        />
      )}
    </div>
  );
}
function SeriesEditor({
  series,
  data,
  refresh,
  notice,
}: {
  series: Series;
  data: Data;
  refresh: () => Promise<void>;
  notice: Notice;
}) {
  const [draft, setDraft] = useState(series),
    [base, setBase] = useState(JSON.stringify(series)),
    [tab, setTab] = useState("roadmap"),
    [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(draft) !== base;
  useDirty(dirty);
  const set = (p: Partial<Series>) => setDraft({ ...draft, ...p });
  const save = async () => {
    setBusy(true);
    try {
      const s = await api<Series>("/series/" + draft.id, "PUT", draft);
      setDraft(s);
      setBase(JSON.stringify(s));
      unsaved = false;
      await refresh();
      notice("Series saved. Linked manuscripts will flag changes for review.");
      return s;
    } catch (e) {
      notice((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button className="back-link" onClick={() => go("/series")}>
        <ChevronLeft size={15} />
        All series
      </button>
      <PageHeading
        eyebrow="THE BIGGER PICTURE"
        title={draft.title}
        desc={`${draft.volumes.length} planned volumes · ${draft.characters.length} recurring characters · ${draft.genre}`}
      >
        <Badge good={!dirty}>
          {dirty ? "Unsaved changes" : "All changes saved"}
        </Badge>
        <button
          className="primary"
          disabled={busy || !dirty}
          onClick={() => void save()}
        >
          <Save size={16} />
          Save series
        </button>
      </PageHeading>
      <div className="tabs roomy">
        {[
          ["roadmap", "Series roadmap"],
          ["arc", "Volume arcs"],
          ["canon", "Shared bible"],
          ["cast", "Recurring cast"],
          ["threads", "Setups & payoffs"],
        ].map(([id, t]) => (
          <button
            key={id}
            className={tab === id ? "selected" : ""}
            onClick={() => setTab(id)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "roadmap" && (
        <SeriesRoadmapEditor
          series={draft}
          books={data.books}
          onChange={set}
          onVolumes={() => setTab("arc")}
          onCast={() => setTab("cast")}
        />
      )}
      {tab === "arc" && (
        <>
          <div className="panel series-overview">
            <div className="two-fields">
              <Field label="Series title">
                <input
                  value={draft.title}
                  onChange={(e) => set({ title: e.target.value })}
                />
              </Field>
              <Field label="Genre">
                <select
                  value={draft.genre}
                  onChange={(e) => set({ genre: e.target.value })}
                >
                  {GENRES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="The promise of this series">
              <textarea
                rows={3}
                value={draft.premise}
                onChange={(e) => set({ premise: e.target.value })}
                placeholder="What is the central conflict, and how will the world change by the final book?"
              />
            </Field>
          </div>
          <div className="volume-timeline">
            {draft.volumes.map((v, i) => {
              const b = data.books.find((b) => b.volumeId === v.id);
              const change = (p: Partial<typeof v>) =>
                set({
                  volumes: draft.volumes.map((x) =>
                    x.id === v.id ? { ...x, ...p } : x,
                  ),
                });
              return (
                <section className="volume-row" key={v.id}>
                  <div className="volume-number">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="panel volume-card">
                    <div className="volume-header">
                      <span className="eyebrow">BOOK {i + 1}</span>
                      {b ? (
                        <Badge good>Manuscript started</Badge>
                      ) : (
                        <Badge>Planning</Badge>
                      )}
                      <IconButton
                        label={"Remove volume " + (i + 1)}
                        onClick={() => {
                          if (b) {
                            notice(
                              "This volume has a manuscript. It cannot be removed.",
                            );
                            return;
                          }
                          if (volumeHasRoadmapReferences(draft, v.id)) {
                            notice(
                              "Move or remove this volume’s roadmap milestones and character beats before deleting it.",
                            );
                            return;
                          }
                          if (confirm("Remove this volume?"))
                            set({
                              volumes: draft.volumes.filter(
                                (x) => x.id !== v.id,
                              ),
                              threads: draft.threads.map((t) => ({
                                ...t,
                                setup: t.setup === v.id ? "" : t.setup,
                                payoff: t.payoff === v.id ? "" : t.payoff,
                              })),
                            });
                        }}
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </div>
                    <Field label="Volume title">
                      <input
                        value={v.title}
                        onChange={(e) => change({ title: e.target.value })}
                      />
                    </Field>
                    <Field label="Book arc">
                      <textarea
                        rows={3}
                        value={v.arc}
                        onChange={(e) => change({ arc: e.target.value })}
                      />
                    </Field>
                    <div className="two-fields">
                      <Field label="Ending & handoff">
                        <textarea
                          rows={3}
                          value={v.ending}
                          onChange={(e) => change({ ending: e.target.value })}
                        />
                      </Field>
                      <Field label="Progression milestone">
                        <textarea
                          rows={3}
                          value={v.progression}
                          onChange={(e) =>
                            change({ progression: e.target.value })
                          }
                        />
                      </Field>
                    </div>
                    <button
                      className="text-button"
                      onClick={async () => {
                        if (dirty) {
                          notice(
                            "Save the series before opening or creating a manuscript.",
                          );
                          return;
                        }
                        if (b) {
                          go("/book/" + b.id);
                          return;
                        }
                        try {
                          const c = forge({
                            ...defaultForge,
                            seed: uuid(),
                            genre: GENRES.includes(
                              draft.genre as (typeof GENRES)[number],
                            )
                              ? (draft.genre as (typeof GENRES)[number])
                              : "LitRPG",
                            culture: draft.culture,
                            location: draft.location,
                            era: draft.era,
                            locked: {
                              protagonist:
                                draft.characters[0]?.name ||
                                "Protagonist (name pending)",
                            },
                          });
                          const n = newBook(c, draft.id, v.id);
                          n.title = v.title;
                          n.premise = v.arc;
                          n.bible =
                            draft.canon +
                            "\n\nENDING & HANDOFF\n" +
                            v.ending +
                            "\n\nPROGRESSION\n" +
                            v.progression;
                          n.characters = draft.characters;
                          const saved = await api<Book>("/books", "POST", n);
                          await refresh();
                          go("/book/" + saved.id);
                        } catch (e) {
                          notice((e as Error).message);
                        }
                      }}
                    >
                      {b ? "Open manuscript" : "Create this manuscript"}
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
          <button
            className="secondary"
            disabled={draft.volumes.length >= 20}
            onClick={() =>
              set({
                volumes: [
                  ...draft.volumes,
                  {
                    id: uuid(),
                    title: `Book ${draft.volumes.length + 1}`,
                    arc: "",
                    ending: "",
                    progression: "",
                  },
                ],
              })
            }
          >
            <Plus size={16} />
            Add a volume
          </button>
        </>
      )}
      {tab === "canon" && (
        <div className="panel">
          <div className="two-fields">
            <Field label="Primary setting">
              <input
                value={draft.location}
                onChange={(e) => set({ location: e.target.value })}
              />
            </Field>
            <Field label="Era">
              <input
                value={draft.era}
                onChange={(e) => set({ era: e.target.value })}
              />
            </Field>
          </div>
          <PlacePicker
            value={draft.location}
            onChange={(location) => set({ location })}
          />
          <NamingSuggestions
            location={draft.location}
            culture={draft.culture}
            onSelect={(culture) => set({ culture })}
          />
          <Field
            label="Default naming background"
            hint="Individual characters can have different backgrounds and origins."
          >
            <select
              value={draft.culture}
              onChange={(e) => set({ culture: e.target.value })}
            >
              <CultureOptions />
            </select>
          </Field>
          <Field
            label="Shared series canon"
            hint="World rules, system costs, geography, timeline anchors, factions, and facts every volume must preserve."
          >
            <textarea
              className="long-text"
              rows={19}
              value={draft.canon}
              onChange={(e) => set({ canon: e.target.value })}
            />
          </Field>
        </div>
      )}
      {tab === "cast" && (
        <CharacterEditor
          characters={draft.characters}
          onChange={(characters) => {
            if (
              roadmapFor(draft).characterArcs.some(
                (a) => !characters.some((c) => c.id === a.characterId),
              )
            ) {
              notice(
                "Remove the character’s planned series arc before removing them from the recurring cast.",
              );
              return;
            }
            set({ characters });
          }}
          defaultCulture={draft.culture}
          defaultLocation={draft.location}
          defaultEra={draft.era}
          notice={notice}
        />
      )}
      {tab === "threads" && (
        <>
          <div className="section-title">
            <div>
              <h3>Every promise deserves a payoff.</h3>
              <p>
                Map what you plant, where it returns, and what is still
                unresolved.
              </p>
            </div>
            <button
              className="secondary"
              onClick={() =>
                set({
                  threads: [
                    ...draft.threads,
                    {
                      id: uuid(),
                      name: "",
                      setup: draft.volumes[0]?.id || "",
                      payoff: draft.volumes.at(-1)?.id || "",
                      resolved: false,
                    },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add thread
            </button>
          </div>
          {draft.threads.map((t) => {
            const change = (p: Partial<typeof t>) =>
              set({
                threads: draft.threads.map((x) =>
                  x.id === t.id ? { ...x, ...p } : x,
                ),
              });
            return (
              <div className="panel thread-row" key={t.id}>
                <Field label="Narrative promise">
                  <input
                    value={t.name}
                    onChange={(e) => change({ name: e.target.value })}
                  />
                </Field>
                {(["setup", "payoff"] as const).map((key) => (
                  <Field
                    key={key}
                    label={key === "setup" ? "Planted in" : "Paid off in"}
                  >
                    <select
                      value={t[key]}
                      onChange={(e) => change({ [key]: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {draft.volumes.map((v, i) => (
                        <option key={v.id} value={v.id}>
                          {i + 1}. {v.title}
                        </option>
                      ))}
                    </select>
                  </Field>
                ))}
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={t.resolved}
                    onChange={(e) => change({ resolved: e.target.checked })}
                  />
                  Resolved
                </label>
                <IconButton
                  label="Remove thread"
                  onClick={() =>
                    set({ threads: draft.threads.filter((x) => x.id !== t.id) })
                  }
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            );
          })}
          {!draft.threads.length && (
            <Empty
              title="Leave a thread for your future self"
              text="Track mysteries, promises, relationships and progression milestones across volumes."
            />
          )}
        </>
      )}
    </>
  );
}
function BookEditor({
  book,
  data,
  settings,
  refresh,
  notice,
}: {
  book: Book;
  data: Data;
  settings: Settings | null;
  refresh: () => Promise<void>;
  notice: Notice;
}) {
  const [draft, setDraft] = useState(book),
    [base, setBase] = useState(JSON.stringify(book)),
    [tab, setTab] = useState(book.chapters.length ? "manuscript" : "outline"),
    [chapterId, setChapterId] = useState(book.chapters[0]?.id || ""),
    [busy, setBusy] = useState(false),
    [run, setRun] = useState<Job["kind"] | null>(null),
    [memoryAll, setMemoryAll] = useState(false),
    [budget, setBudget] = useState(2),
    [maxRequests, setMaxRequests] = useState(20),
    [maxOutput, setMaxOutput] = useState(8000),
    [revisions, setRevisions] = useState<
      Array<{
        id: string;
        chapter_id: string;
        title: string;
        body: string;
        reason: string;
        created_at: string;
      }>
    >([]);
  const dirty = JSON.stringify(draft) !== base;
  useDirty(dirty);
  const [focus, setFocus] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [recoveryOpen, setRecoveryOpen] = useState(false),
    [textSize, setTextSize] = useState(18),
    [lineSpacing, setLineSpacing] = useState(1.95),
    [pendingHit, setPendingHit] = useState<ManuscriptHit | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null),
    titleRef = useRef<HTMLInputElement>(null);
  const latestDraft = useRef(draft),
    latestDirty = useRef(dirty),
    saveInFlight = useRef(false);
  latestDraft.current = draft;
  latestDirty.current = dirty;
  const recovery = useDeviceRecovery(draft, dirty, chapterId);
  useEffect(() => {
    document.body.classList.toggle("focus-writing", focus);
    return () => document.body.classList.remove("focus-writing");
  }, [focus]);
  useEffect(() => {
    if (!pendingHit || tab !== "manuscript" || searchOpen) return;
    const frame = requestAnimationFrame(() => {
      const el =
        pendingHit.field === "title" ? titleRef.current : editorRef.current;
      if (el) {
        el.scrollIntoView({ block: "center" });
        revealTextSelection(el, pendingHit.start, pendingHit.end);
      }
      setPendingHit(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pendingHit, tab, chapterId, searchOpen]);
  const chapter = draft.chapters.find((c) => c.id === chapterId);
  const activeJob = data.jobs.find(
    (j) => j.bookId === book.id && ["running", "queued"].includes(j.status),
  );
  const series = data.series.find((s) => s.id === book.seriesId);
  useEffect(() => {
    if (!dirty) {
      setDraft(book);
      setBase(JSON.stringify(book));
      if (!book.chapters.some((c) => c.id === chapterId))
        setChapterId(book.chapters[0]?.id || "");
    }
  }, [book.rev]);
  const set = (p: Partial<Book>) => {
    const next = { ...latestDraft.current, ...p };
    latestDraft.current = next;
    setDraft(next);
  };
  const setChapter = (p: Partial<Book["chapters"][number]>) =>
    set({
      chapters: draft.chapters.map((c) =>
        c.id === chapterId ? { ...c, ...p } : c,
      ),
    });
  const save = async () => {
    if (saveInFlight.current || activeJob) return;
    saveInFlight.current = true;
    const submitted = latestDraft.current;
    recovery.flush();
    setBusy(true);
    try {
      const b = await api<Book>("/books/" + submitted.id, "PUT", submitted);
      const next = retainNewerEdits(submitted, latestDraft.current, b);
      const stillDirty = JSON.stringify(next) !== JSON.stringify(b);
      latestDraft.current = next;
      latestDirty.current = stillDirty;
      setDraft(next);
      setBase(JSON.stringify(b));
      unsaved = stillDirty;
      recovery.saved(next, stillDirty);
      await refresh();
      return b;
    } catch (e) {
      recovery.flush();
      notice((e as Error).message);
    } finally {
      saveInFlight.current = false;
      setBusy(false);
    }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"]')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (latestDirty.current && !busy && !activeJob) void save();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "f"
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape" && focus) setFocus(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
  const restoreDevice = (copy: DeviceCopy) => {
    if (
      latestDirty.current ||
      busy ||
      activeJob ||
      !canRestoreWhole(copy.record, book)
    ) {
      notice(
        "Save current edits first. A device draft can replace the editor only when its server revision still matches.",
      );
      return;
    }
    setDraft(copy.record.book);
    latestDraft.current = copy.record.book;
    setChapterId(
      copy.record.book.chapters.some((c) => c.id === copy.record.chapterId)
        ? copy.record.chapterId
        : copy.record.book.chapters[0]?.id || "",
    );
    setTab("manuscript");
    setRecoveryOpen(false);
    notice(
      "Device draft loaded. Review it, then press Save. The original device copy is kept until you discard it.",
    );
  };
  const addRecovered = (record: RecoveryRecord, id: string) => {
    const current = latestDraft.current,
      source = record.book.chapters.find((c) => c.id === id);
    if (!source || busy || activeJob || current.chapters.length >= 100) return;
    const added = recoveredChapter(source, uuid());
    set({ chapters: [...current.chapters, added] });
    setChapterId(added.id);
    setTab("manuscript");
    setRecoveryOpen(false);
    notice(
      "Recovered chapter added as a new unsaved draft. Existing chapters were not replaced.",
    );
  };
  const start = async () => {
    setBusy(true);
    try {
      if (dirty) {
        const b = await save();
        if (!b) return;
        if (latestDirty.current) {
          notice(
            "New edits arrived while saving. Save them before starting a writing job.",
          );
          return;
        }
        setBusy(true);
      }
      await api("/books/" + draft.id + "/jobs", "POST", {
        kind: run,
        chapterId: run === "memory" && memoryAll ? undefined : chapterId,
        budget,
        maxRequests,
        maxOutputTokens: maxOutput,
        confirmed: true,
      });
      setRun(null);
      await refresh();
      notice(
        "Writing job started. You can leave the page; progress is saved on the server.",
      );
    } catch (e) {
      notice((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const loadVersions = async () => {
    try {
      const r = await api<typeof revisions>("/books/" + book.id + "/revisions");
      setRevisions(r);
    } catch (e) {
      notice((e as Error).message);
    }
  };
  return (
    <>
      {searchOpen && (
        <Modal title="Find in this book" close={() => setSearchOpen(false)}>
          <ManuscriptSearch
            book={draft}
            onSelect={(hit) => {
              setChapterId(hit.chapterId);
              setTab("manuscript");
              setPendingHit(hit);
              setSearchOpen(false);
            }}
          />
        </Modal>
      )}
      {recoveryOpen && (
        <Modal
          title="Device draft recovery"
          close={() => setRecoveryOpen(false)}
        >
          <DeviceRecoveryPanel
            copies={recovery.copies}
            server={book}
            enabled={recovery.enabled}
            error={recovery.error}
            lastCopy={recovery.lastCopy}
            onToggle={recovery.toggle}
            onRestore={restoreDevice}
            onCopyChapter={addRecovered}
            onDiscard={recovery.discard}
            blocked={dirty || busy || !!activeJob}
            appendBlocked={busy || !!activeJob || draft.chapters.length >= 100}
          />
        </Modal>
      )}
      <div className="manuscript-header">
        <div>
          <button className="back-link" onClick={() => go("/library")}>
            <ChevronLeft size={14} />
            Your library
          </button>
          <div className="manuscript-title">
            <h1>{draft.title}</h1>
            <Badge>{draft.genre}</Badge>
            {draft.sample && <Badge>Editable sample</Badge>}
          </div>
          <p>
            {series ? (
              <button
                className="inline-link"
                onClick={() => go("/series/" + series.id)}
              >
                <Layers3 size={13} />
                {series.title}
              </button>
            ) : (
              "Standalone manuscript"
            )}
            <span>·</span>
            {bookWords(draft).toLocaleString()} words<span>·</span>
            {draft.chapters.length} chapters
          </p>
        </div>
        <div className="heading-actions">
          <span className={"save-status " + (dirty ? "pending" : "")}>
            <i className="status-dot" />
            {busy
              ? "Saving…"
              : dirty
                ? "Unsaved changes"
                : "Saved to your studio"}
          </span>
          <button
            className="secondary"
            onClick={() => {
              if (dirty) {
                notice("Save your changes before exporting.");
                return;
              }
              location.href = "/api/books/" + book.id + "/export";
            }}
          >
            <Download size={16} />
            Export
          </button>
          <button
            className="primary"
            disabled={busy || !dirty || !!activeJob}
            onClick={() => void save()}
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>
      {draft.continuityNotice && (
        <div className="notice warning book-notice">
          <AlertTriangle size={17} />
          <span>{draft.continuityNotice}</span>
          <button
            onClick={() => {
              if (
                confirm(
                  "Have you reviewed the changed material and any downstream continuity? This acknowledges the warning; it does not automatically repair the book.",
                )
              )
                set({ continuityNotice: "" });
            }}
          >
            Acknowledge review
          </button>
        </div>
      )}
      {activeJob && (
        <div className="notice book-notice">
          <LoaderCircle className="spin" size={17} />
          <span>{activeJob.message}</span>
          <button onClick={() => go("/jobs")}>View progress</button>
        </div>
      )}
      <div className="manuscript-tabs tabs">
        {[
          ["outline", "Outline"],
          ["manuscript", "Manuscript"],
          ["bible", "Story bible"],
          ["cast", "Characters"],
          ["memory", "Story memory"],
          ["versions", "Version history"],
        ].map(([id, t]) => (
          <button
            key={id}
            className={tab === id ? "selected" : ""}
            onClick={() => {
              setTab(id);
              if (id === "versions") void loadVersions();
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {recovery.error && (
        <div className="notice warning book-notice" role="status">
          {recovery.error}
        </div>
      )}
      {recovery.copies.length > 0 && (
        <div className="notice book-notice">
          <ShieldCheck size={17} />
          <span>
            {recovery.copies.length} device draft
            {recovery.copies.length === 1 ? "" : "s"} available. Nothing has
            been restored automatically.
          </span>
          <button onClick={() => setRecoveryOpen(true)}>
            Review device drafts
          </button>
        </div>
      )}
      {tab === "manuscript" && (
        <>
          <WritingTools
            book={draft}
            chapterId={chapterId}
            onChapter={setChapterId}
            focus={focus}
            onFocus={() => setFocus(!focus)}
            onSearch={() => setSearchOpen(true)}
            onRecovery={() => setRecoveryOpen(true)}
            recoveryCount={recovery.copies.length}
            textSize={textSize}
            onTextSize={setTextSize}
            lineSpacing={lineSpacing}
            onLineSpacing={setLineSpacing}
            onSave={() => void save()}
            canSave={dirty && !busy && !activeJob}
            busy={busy}
          />
          <div className="device-status" aria-live="polite">
            {focus &&
              (busy
                ? "Saving… · "
                : dirty
                  ? "Unsaved changes · "
                  : "Saved to your studio · ")}
            {recovery.enabled
              ? recovery.error
                ? "Device recovery needs attention"
                : dirty
                  ? recovery.lastCopy
                    ? "Device copy: " +
                      new Date(recovery.lastCopy).toLocaleTimeString() +
                      " · Save to update your studio"
                    : "Preparing device copy…"
                  : "Device recovery on · No pending edits"
              : "Device recovery off · Save explicitly with Ctrl/Cmd + S"}
          </div>
        </>
      )}
      {tab === "manuscript" && (
        <div className="writing-layout">
          <aside className="chapter-sidebar">
            <div className="chapter-list-head">
              <span>MANUSCRIPT</span>
              <IconButton
                label="Add chapter"
                onClick={() => {
                  const c = chapterTemplate(draft.chapters.length + 1);
                  set({ chapters: [...draft.chapters, c] });
                  setChapterId(c.id);
                }}
              >
                <Plus size={17} />
              </IconButton>
            </div>
            {draft.chapters.map((c, i) => (
              <button
                key={c.id}
                className={
                  "chapter-nav " + (c.id === chapterId ? "selected" : "")
                }
                onClick={() => setChapterId(c.id)}
              >
                <span className="chapter-nav-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  {c.title}
                  <small>
                    {c.body
                      ? words(c.body).toLocaleString() + " words"
                      : "Not drafted"}
                  </small>
                </div>
                {c.body && <i className="status-dot" />}
              </button>
            ))}
            <button
              className="chapter-add"
              onClick={() => {
                const c = chapterTemplate(draft.chapters.length + 1);
                set({ chapters: [...draft.chapters, c] });
                setChapterId(c.id);
              }}
            >
              <Plus size={15} />
              Add chapter
            </button>
            <div className="chapter-side-bottom">
              <span>MANUSCRIPT GOAL</span>
              <strong>
                {bookWords(draft).toLocaleString()}{" "}
                <small>/ {draft.targetWords.toLocaleString()}</small>
              </strong>
              <div className="book-progress">
                <i
                  style={{
                    width:
                      Math.min(
                        100,
                        (bookWords(draft) / draft.targetWords) * 100,
                      ) + "%",
                  }}
                />
              </div>
            </div>
          </aside>
          <div className="writing-center">
            {chapter ? (
              <>
                <div className="editor-toolbar">
                  <span>
                    <Feather size={14} />
                    Plain-text manuscript
                  </span>
                  <span>
                    {words(chapter.body).toLocaleString()} words
                    <span className="toolbar-sep">|</span>
                    <IconButton
                      label="Delete current chapter"
                      onClick={() => {
                        if (
                          confirm(
                            "Remove this chapter? Its last saved body will be available in version history after you save.",
                          )
                        ) {
                          set({
                            chapters: draft.chapters.filter(
                              (c) => c.id !== chapterId,
                            ),
                          });
                          setChapterId(
                            draft.chapters.find((c) => c.id !== chapterId)
                              ?.id || "",
                          );
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </span>
                </div>
                <article className="manuscript-paper">
                  <div className="paper-chapter">
                    CHAPTER{" "}
                    {String(
                      draft.chapters.findIndex((c) => c.id === chapterId) + 1,
                    ).padStart(2, "0")}
                  </div>
                  <input
                    className="paper-title"
                    ref={titleRef}
                    disabled={!!activeJob}
                    aria-label="Chapter title"
                    value={chapter.title}
                    onChange={(e) => setChapter({ title: e.target.value })}
                  />
                  <div className="paper-ornament">◆</div>
                  <textarea
                    aria-label="Chapter manuscript"
                    className="prose-editor"
                    ref={editorRef}
                    style={{ fontSize: textSize, lineHeight: lineSpacing }}
                    placeholder="Every story begins with a first line. Write yours here…"
                    value={chapter.body}
                    onChange={(e) =>
                      setChapter({ body: e.target.value, status: "revised" })
                    }
                    spellCheck
                    disabled={!!activeJob}
                  />
                </article>
                <div className="editor-bottom">
                  <span>Manual edits are saved when you press Save.</span>
                  <span>YOUR VOICE. YOUR FINAL SAY.</span>
                </div>
              </>
            ) : (
              <Empty
                title="The first page is yours"
                text="Add a chapter or generate an outline to begin."
              >
                <button className="primary" onClick={() => setTab("outline")}>
                  Plan your chapters
                  <ArrowRight size={16} />
                </button>
              </Empty>
            )}
          </div>
          <aside className="writing-assistant">
            <div className="assistant-heading">
              <span className="assistant-icon">
                <Sparkles size={19} />
              </span>
              <h3>Your writing partner</h3>
            </div>
            <p className="assistant-intro">
              Grounded in your world.
              <br />
              Guided by your choices.
            </p>
            <div className="assistant-context">
              <span>
                <CheckCircle2 size={13} />
                Book bible
              </span>
              <span>
                <CheckCircle2 size={13} />
                Approved character names
              </span>
              {series && (
                <span>
                  <CheckCircle2 size={13} />
                  Shared series & volume arc
                </span>
              )}
            </div>
            {chapter && (
              <>
                <Field label="This chapter’s direction">
                  <textarea
                    rows={5}
                    value={chapter.brief}
                    onChange={(e) => setChapter({ brief: e.target.value })}
                    placeholder="What changes in this chapter? What must stay hidden?"
                  />
                </Field>
                <button
                  className="primary wide"
                  disabled={!!activeJob}
                  onClick={() => setRun("draft")}
                >
                  <Sparkles size={16} />
                  {chapter.body ? "Redraft chapter" : "Draft chapter"}
                </button>
                <button
                  className="secondary wide"
                  disabled={!chapter.body || !!activeJob}
                  onClick={() => setRun("review")}
                >
                  <ScrollText size={16} />
                  Review this chapter
                </button>
                {chapter.findings.length > 0 && (
                  <div className="review-findings">
                    <h4>{chapter.findings.length} editorial suggestions</h4>
                    {chapter.findings.map((f, i) => (
                      <div className="finding" key={i}>
                        <Badge>{f.severity}</Badge>
                        <blockquote>“{f.quote}”</blockquote>
                        <p>{f.issue}</p>
                        <p className="suggestion">{f.suggestion}</p>
                        <button
                          className="text-button"
                          onClick={() => {
                            if (chapter.body.split(f.quote).length !== 2) {
                              notice(
                                "This quote is missing or appears more than once. Apply the suggestion manually to avoid changing the wrong passage.",
                              );
                              return;
                            }
                            setChapter({
                              body: chapter.body.replace(f.quote, f.suggestion),
                              status: "revised",
                              findings: chapter.findings.filter(
                                (_, n) => n !== i,
                              ),
                            });
                          }}
                        >
                          Apply suggestion
                          <Check size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {!settings?.ready && (
              <div className="assistant-offline">
                <LockKeyhole size={16} />
                <p>
                  AI generation is not connected. Your writing tools still work.
                </p>
                <button onClick={() => go("/settings")}>
                  Connection settings
                  <ArrowUpRight size={13} />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
      {tab === "outline" && (
        <div className="book-panel-area">
          <div className="section-title">
            <div>
              <h2>Give every chapter a purpose.</h2>
              <p>Plan the turns, choices, and consequences before the prose.</p>
            </div>
            <div className="heading-actions">
              <button
                className="secondary"
                disabled={!!activeJob}
                onClick={() => setRun("plan")}
              >
                <Sparkles size={16} />
                Generate outline
              </button>
              <button
                className="primary"
                disabled={!!activeJob}
                onClick={() => setRun("autopilot")}
              >
                <Play size={16} />
                Run autopilot
              </button>
            </div>
          </div>
          <section className="panel">
            <div className="three-fields">
              <Field label="Book title">
                <input
                  value={draft.title}
                  onChange={(e) => set({ title: e.target.value })}
                />
              </Field>
              <Field label="Target words">
                <input
                  type="number"
                  min={1000}
                  max={200000}
                  step={1000}
                  value={draft.targetWords}
                  onChange={(e) => set({ targetWords: Number(e.target.value) })}
                />
              </Field>
              <Field label="Planned chapters">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={draft.chapterCount}
                  onChange={(e) =>
                    set({ chapterCount: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <Field label="Premise">
              <textarea
                rows={3}
                value={draft.premise}
                onChange={(e) => set({ premise: e.target.value })}
              />
            </Field>
          </section>
          <div className="outline-grid">
            {draft.chapters.map((c, i) => (
              <section className="panel outline-card" key={c.id}>
                <div className="outline-card-number">
                  CHAPTER {String(i + 1).padStart(2, "0")}
                  <Badge good={!!c.body}>
                    {c.body ? "Draft exists" : "Planned"}
                  </Badge>
                </div>
                <Field label="Title">
                  <input
                    value={c.title}
                    onChange={(e) =>
                      set({
                        chapters: draft.chapters.map((x) =>
                          x.id === c.id ? { ...x, title: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Chapter contract">
                  <textarea
                    rows={5}
                    value={c.brief}
                    onChange={(e) =>
                      set({
                        chapters: draft.chapters.map((x) =>
                          x.id === c.id ? { ...x, brief: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Goal, conflict, change, setup and payoff…"
                  />
                </Field>
                <button
                  className="text-button"
                  onClick={() => {
                    setChapterId(c.id);
                    setTab("manuscript");
                  }}
                >
                  Open chapter
                  <ArrowRight size={15} />
                </button>
              </section>
            ))}
            <button
              className="outline-add"
              onClick={() =>
                set({
                  chapters: [
                    ...draft.chapters,
                    chapterTemplate(draft.chapters.length + 1),
                  ],
                })
              }
            >
              <Plus size={22} />
              Add a chapter card
            </button>
          </div>
        </div>
      )}
      {tab === "bible" && (
        <div className="book-panel-area">
          <div className="section-title">
            <div>
              <h2>The truths of your world.</h2>
              <p>
                Keep rules, costs, relationships and timeline anchors explicit.
              </p>
            </div>
            {series && (
              <button
                className="secondary"
                onClick={() => go("/series/" + series.id)}
              >
                <Layers3 size={16} />
                Shared series bible
              </button>
            )}
          </div>
          <section className="panel">
            <div className="three-fields">
              <Field label="Location">
                <input
                  value={draft.location}
                  onChange={(e) => set({ location: e.target.value })}
                />
              </Field>
              <Field label="Era">
                <input
                  value={draft.era}
                  onChange={(e) => set({ era: e.target.value })}
                />
              </Field>
              <Field label="Tone">
                <input
                  value={draft.tone}
                  onChange={(e) => set({ tone: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Book-specific canon">
              <textarea
                rows={23}
                className="long-text"
                value={draft.bible}
                onChange={(e) => set({ bible: e.target.value })}
              />
            </Field>
            {series && (
              <div className="notice">
                <Link2 size={18} />
                <span>
                  Series canon is included separately in AI context. Keep
                  book-specific notes here; edit shared rules in the series
                  studio.
                </span>
              </div>
            )}
          </section>
          <div className="notice">
            <Info size={18} />
            <span>
              System rules currently guide planning and AI prompts. A
              deterministic XP / inventory simulator is not implemented in this
              preview.
            </span>
          </div>
        </div>
      )}
      {tab === "cast" && (
        <div className="book-panel-area">
          {series && (
            <div className="notice">
              <Users size={17} />
              <span>
                The series cast is also included in generation. Avoid
                conflicting book-specific versions of the same character.
              </span>
            </div>
          )}
          {series && (
            <div className="shared-cast">
              {series.characters.map((c) => (
                <div className="shared-cast-card" key={c.id}>
                  <Users size={17} />
                  <div>
                    <strong>{c.name}</strong>
                    <small>
                      {c.role} · {c.origin} · {c.language}
                    </small>
                  </div>
                  <Badge>Series cast</Badge>
                </div>
              ))}
              <button
                className="text-button"
                onClick={() => go("/series/" + series.id)}
              >
                Edit shared characters in series studio
                <ArrowUpRight size={15} />
              </button>
            </div>
          )}
          <CharacterEditor
            characters={draft.characters.filter(
              (c) => !series?.characters.some((s) => s.id === c.id),
            )}
            onChange={(characters) =>
              set({
                characters: [...(series?.characters || []), ...characters],
              })
            }
            defaultCulture={draft.culture}
            defaultLocation={draft.location}
            defaultEra={draft.era}
            notice={notice}
          />
        </div>
      )}
      {tab === "memory" && (
        <StoryMemory
          book={draft}
          books={data.books}
          series={series}
          chapterId={chapterId}
          onChapter={setChapterId}
          onChange={set}
          disabled={busy || !!activeJob}
          onRun={(all) => {
            setMemoryAll(all);
            setRun("memory");
          }}
          onSource={(id, cid) => {
            if (id === draft.id) {
              setChapterId(cid);
              setTab("manuscript");
            } else go("/book/" + id);
          }}
        />
      )}
      {tab === "versions" && (
        <div className="book-panel-area">
          <div className="section-title">
            <div>
              <h2>Nothing good has to be lost.</h2>
              <p>
                Previous saved chapter bodies are preserved before replacement
                or removal.
              </p>
            </div>
            <button className="secondary" onClick={() => void loadVersions()}>
              <RotateCcw size={15} />
              Refresh history
            </button>
          </div>
          {revisions.map((r) => (
            <div className="panel revision-row" key={r.id}>
              <div>
                <h3>{r.title}</h3>
                <p>
                  {r.reason} · {new Date(r.created_at).toLocaleString()} ·{" "}
                  {words(r.body)} words
                </p>
                <details>
                  <summary>Preview saved text</summary>
                  <pre>{r.body || "(Empty chapter)"}</pre>
                </details>
              </div>
              <button
                className="secondary"
                onClick={async () => {
                  if (dirty) {
                    notice("Save or discard your changes before restoring.");
                    return;
                  }
                  if (
                    !confirm(
                      "Restore this chapter version? The current saved text will be kept in history.",
                    )
                  )
                    return;
                  if (saveInFlight.current || activeJob) return;
                  try {
                    saveInFlight.current = true;
                    setBusy(true);
                    const submitted = latestDraft.current;
                    const b = await api<Book>(
                      "/books/" + book.id + "/restore",
                      "POST",
                      { revisionId: r.id, expectedRev: draft.rev },
                    );
                    const next = retainNewerEdits(
                      submitted,
                      latestDraft.current,
                      b,
                    );
                    const stillDirty =
                      JSON.stringify(next) !== JSON.stringify(b);
                    latestDraft.current = next;
                    latestDirty.current = stillDirty;
                    setDraft(next);
                    setBase(JSON.stringify(b));
                    unsaved = stillDirty;
                    recovery.saved(next, stillDirty);
                    await refresh();
                    await loadVersions();
                    notice("Chapter restored. Review downstream continuity.");
                  } catch (e) {
                    notice((e as Error).message);
                  } finally {
                    saveInFlight.current = false;
                    setBusy(false);
                  }
                }}
              >
                <RotateCcw size={15} />
                Restore
              </button>
            </div>
          ))}
          {!revisions.length && (
            <Empty
              title="Your history starts with your next edit"
              text="Save a changed chapter to preserve its previous saved version here."
            />
          )}
        </div>
      )}
      {run && (
        <Modal
          title={
            run === "memory"
              ? "Build story memory"
              : run === "autopilot"
                ? "Start a bounded writing run"
                : run === "plan"
                  ? "Generate your book outline"
                  : run === "review"
                    ? "Review this chapter"
                    : "Draft this chapter"
          }
          close={() => setRun(null)}
        >
          <div className="notice">
            <ShieldCheck size={18} />
            <span>
              {run === "memory"
                ? "Extracts source-quoted memory from saved prose, one request per chapter within your approved limits. Does not rewrite prose or certify its correctness. Missing/stale mode skips current ledgers. Review and unpin stale facts first. Completed ledgers are saved as checkpoints."
                : run === "autopilot"
                  ? "Plans if needed, then drafts unwritten chapters in order. Existing chapter prose is skipped. Each completed step is saved."
                  : run === "draft"
                    ? "Existing chapter prose will be replaced only after a successful response. A previous-version checkpoint is preserved."
                    : "Your book bible, approved cast, and linked series plan are included in the request."}
            </span>
          </div>
          {!settings?.ready ? (
            <>
              <div className="notice warning">
                <LockKeyhole size={18} />
                <span>{settings?.reason || "Configure OpenAI first."}</span>
              </div>
              <p className="microcopy">
                No model output is simulated. In Coolify, add the server-side
                key, model, verified prices, and spending opt-in.
              </p>
              <button
                className="secondary wide"
                onClick={() => {
                  setRun(null);
                  go("/settings");
                }}
              >
                Open connection settings
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="three-fields">
                <Field label="Run budget (USD)">
                  <input
                    type="number"
                    min={0.1}
                    max={100}
                    step={0.1}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                  />
                </Field>
                <Field label="Max requests">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={maxRequests}
                    onChange={(e) => setMaxRequests(Number(e.target.value))}
                  />
                </Field>
                <Field label="Output tokens / call">
                  <input
                    type="number"
                    min={1000}
                    max={12000}
                    step={1000}
                    value={maxOutput}
                    onChange={(e) => setMaxOutput(Number(e.target.value))}
                  />
                </Field>
              </div>
              <p className="microcopy">
                Model: {settings.model}. Estimates use server-configured rates.
                A local cap cannot control unrelated use of the same API key.
                Pausing cannot reverse an already-billed request.
              </p>
              <button
                className="primary wide"
                disabled={busy}
                onClick={() => void start()}
              >
                <Play size={17} />
                Authorize up to ${budget.toFixed(2)} and start
              </button>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
function ActivityPage({
  data,
  refresh,
  notice,
}: {
  data: Data;
  refresh: () => Promise<void>;
  notice: Notice;
}) {
  return (
    <>
      <PageHeading
        eyebrow="EVERY CHAPTER, ACCOUNTED FOR"
        title="Writing activity"
        desc="Durable jobs, saved checkpoints, and transparent generation limits."
      >
        <button className="secondary" onClick={() => void refresh()}>
          <RotateCcw size={16} />
          Refresh
        </button>
      </PageHeading>
      {!data.jobs.length && (
        <Empty
          title="A little quiet before the words"
          text="Start a guided chapter or an autopilot run from a manuscript. Progress and usage appear here."
        >
          <button className="primary" onClick={() => go("/library")}>
            Open your library
            <ArrowRight size={16} />
          </button>
        </Empty>
      )}
      {data.jobs.map((j) => (
        <section className="panel job-card" key={j.id}>
          <div className="job-head">
            <span className="assistant-icon">
              {j.status === "running" ? (
                <LoaderCircle className="spin" />
              ) : (
                <Feather />
              )}
            </span>
            <div>
              <h3>
                {data.books.find((b) => b.id === j.bookId)?.title ||
                  "Removed book"}
              </h3>
              <p>
                {j.kind} · {new Date(j.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge good={j.status === "done"}>{j.status}</Badge>
          </div>
          <p>{j.message}</p>
          <div className="job-metrics">
            <span>{j.steps} checkpoints saved</span>
            <span>
              {j.requests}/{j.maxRequests} requests
            </span>
            <span>${j.spent.toFixed(4)} estimated from reported tokens</span>
            <span>${j.uncertain.toFixed(4)} reserved / uncertain</span>
            <span>${j.budget.toFixed(2)} budget</span>
          </div>
          <div className="job-actions">
            <button
              className="secondary"
              onClick={() => go("/book/" + j.bookId)}
            >
              Open manuscript
              <ArrowUpRight size={15} />
            </button>
            {(["running", "queued"].includes(j.status)
              ? ["pause", "cancel"]
              : j.status === "paused"
                ? ["resume", "cancel"]
                : []
            ).map((action) => (
              <button
                className="secondary"
                key={action}
                onClick={async () => {
                  try {
                    await api("/jobs/" + j.id + "/control", "POST", { action });
                    await refresh();
                  } catch (e) {
                    notice((e as Error).message);
                  }
                }}
              >
                {action === "pause" ? (
                  <Pause size={14} />
                ) : action === "resume" ? (
                  <Play size={14} />
                ) : (
                  <Square size={14} />
                )}{" "}
                {action}
              </button>
            ))}
          </div>
          <details>
            <summary>Checkpoint log</summary>
            <pre>{j.events.join("\n")}</pre>
          </details>
        </section>
      ))}
    </>
  );
}
function SettingsPage({
  settings,
  data,
  refresh,
  notice,
}: {
  settings: Settings | null;
  data: Data;
  refresh: () => Promise<void>;
  notice: Notice;
}) {
  const [importBusy, setImportBusy] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="YOUR STUDIO, YOUR TERMS"
        title="Studio settings"
        desc="A private library. A server-side key. No hidden generation."
      >
        <Badge good>
          <ShieldCheck size={13} />
          Self-hosted edition
        </Badge>
      </PageHeading>
      <div className="settings-grid">
        <section className="panel settings-card">
          <div className="panel-title">
            <Sparkles size={19} />
            <h3>OpenAI connection</h3>
            <Badge good={settings?.ready}>
              {settings?.ready ? "Configured" : "Not connected"}
            </Badge>
          </div>
          <p>{settings?.reason}</p>
          <dl>
            <div>
              <dt>API key</dt>
              <dd>
                {settings?.keyConfigured
                  ? "Configured on server"
                  : "Not configured"}
              </dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{settings?.model || "Choose in Coolify"}</dd>
            </div>
            <div>
              <dt>Generation opt-in</dt>
              <dd>{settings?.paidEnabled ? "Enabled" : "Disabled"}</dd>
            </div>
          </dl>
          <div className="notice">
            <LockKeyhole size={17} />
            <span>
              Never paste your key into chat or this browser. Add it as a secret
              environment variable in Coolify.
            </span>
          </div>
          <details open>
            <summary>Server configuration</summary>
            <pre>{`OPENAI_API_KEY=<Coolify secret>\nOPENAI_MODEL=<your available model>\nENABLE_PAID_GENERATION=true\nOPENAI_INPUT_PRICE_PER_MILLION=<verified USD rate>\nOPENAI_OUTPUT_PRICE_PER_MILLION=<verified USD rate>`}</pre>
          </details>
          <p className="microcopy">
            No connection test is run automatically. Every generation request
            requires a confirmed run budget.
          </p>
        </section>
        <section className="panel settings-card">
          <div className="panel-title">
            <ShieldCheck size={19} />
            <h3>Private hosting</h3>
          </div>
          <dl>
            <div>
              <dt>Deployment target</dt>
              <dd>Coolify</dd>
            </div>
            <div>
              <dt>Management host</dt>
              <dd>coolify.delquro.com</dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>{settings?.storage || "SQLite"}</dd>
            </div>
            <div>
              <dt>Access protection</dt>
              <dd>
                {settings?.demo
                  ? "Synthetic preview only"
                  : "Studio password + secure session"}
              </dd>
            </div>
          </dl>
          <p>
            The management host is not automatically the app’s address. Assign a
            separate HTTPS application domain in Coolify.
          </p>
          <pre>{`PORT=3000\nDATA_DIR=/app/data\nPUBLIC_ORIGIN=https://<your-app-domain>\nAPP_PASSWORD=<long unique secret>\nDEMO_MODE=false`}</pre>
          <p className="microcopy">
            Persist /app/data as a Coolify volume. The API key and password are
            never included in library exports. This screen reports
            configuration, not a completed remote deployment.
          </p>
        </section>
        <section className="panel settings-card">
          <div className="panel-title">
            <Library size={19} />
            <h3>Your library, portable</h3>
          </div>
          <p>
            {data.books.length} books and {data.series.length} series. Download
            your current manuscripts, canon and planning data in an open JSON
            format.
          </p>
          <div className="button-row">
            <a className="secondary button" href="/api/backup">
              <Download size={16} />
              Export library JSON
            </a>
            <label className="secondary button">
              <Upload size={16} />
              {importBusy ? "Importing…" : "Restore library JSON"}
              <input
                className="file-input"
                type="file"
                accept="application/json,.json"
                disabled={importBusy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 4000000) {
                    notice("This preview accepts imports up to 4 MB.");
                    return;
                  }
                  setImportBusy(true);
                  try {
                    const raw = JSON.parse(await file.text());
                    if (
                      !confirm(
                        `Import ${raw.books?.length || 0} books and ${raw.series?.length || 0} series? Existing IDs will be rejected; nothing will be overwritten.`,
                      )
                    )
                      return;
                    const r = await api<{ books: number; series: number }>(
                      "/import",
                      "POST",
                      raw,
                    );
                    await refresh();
                    notice(`Imported ${r.books} books and ${r.series} series.`);
                  } catch (e) {
                    notice((e as Error).message);
                  } finally {
                    setImportBusy(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </div>
          <p className="microcopy">
            Library JSON includes current work, not revision history or jobs.
            For full disaster recovery, back up the SQLite data volume with a
            consistent SQLite backup, not just this export.
          </p>
        </section>
        <section className="panel settings-card">
          <div className="panel-title">
            <Globe2 size={19} />
            <h3>Culturally considered naming</h3>
          </div>
          <p>
            Starter profiles support Japanese, Korean, Mexican Spanish, French,
            English-language UK, Yorùbá, and invented naming palettes.
          </p>
          <ul className="settings-list">
            <li>
              Origin and cultural background are separate, editable fields.
            </li>
            <li>Family-name order and diacritics are preserved.</li>
            <li>
              Characters may have different backgrounds within one location.
            </li>
            <li>Historical suggestions require research or manual naming.</li>
            <li>
              Profiles are starting points, not universal rules or verified
              cultural expertise.
            </li>
          </ul>
        </section>
      </div>
      <div className="notice">
        <Info size={18} />
        <span>
          This working preview includes series planning, writing, revision
          history, guided/autopilot plumbing and Markdown/JSON export.
          Deterministic LitRPG mechanics, full historical name catalogs,
          DOCX/EPUB/print production and audiobooks are not yet implemented.
        </span>
      </div>
    </>
  );
}
