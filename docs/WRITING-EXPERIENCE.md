# Writing in Ghost Writer

Open a book’s **Manuscript** tab. These tools operate on your current working draft, including text you have not saved yet.

## Stay in the manuscript

- **Previous / Next chapter** and **Jump to chapter** switch chapters without throwing away edits. Navigation remains available in focus mode and on mobile.
- **Find in book** searches chapter titles and prose. Results include a highlighted excerpt; selecting one opens the chapter and selects the matching text. Search is literal (not regex), supports Unicode and optional case matching, and displays up to 200 matches. It does not search the story bible, character cards or other books.
- **Focus mode** removes the app navigation, planning tabs, chapter sidebar and AI assistant. Save, chapter navigation, warnings, recovery and Exit focus remain available. Escape exits focus unless a dialog is open; the first Escape closes that dialog.
- **Text size / Spacing** adjust the editor display, not your manuscript or export. These choices and focus mode last for the current editor session.
- The chapter word count and approximate reading time use 220 words per minute, not a writing-time estimate.

### Shortcuts outside dialogs

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + S | Save the working book to the studio |
| Ctrl/Cmd + Shift + F | Find in this book |
| Escape | Close an open dialog, or exit focus mode |

## Explicit studio saves

Press **Save** to update the server. Merely typing, switching chapters, entering focus mode or enabling recovery does not save to the server. Editing during a save no longer gets replaced by the response: post-request changes remain in the editor as unsaved edits, while the returned server revision becomes the new baseline. Save again to persist those newer changes. Version restoration uses the same merge protection.

A failed or revision-conflicted save leaves your draft in the editor. Do not reload until you have protected it. The toolbar’s **Download working draft** arrow saves a Markdown copy of all current chapter text, including unsaved edits, without contacting the server. Existing **Export** still exports the saved server manuscript and requires a clean editor.

## Optional device recovery

Choose **Device drafts → Keep recovery copies for this book on this device**. This is **off by default**, configured per book and browser origin, and appropriate only on a trusted device.

- Copies contain the book’s manuscript, bible, cast and planning fields, stored **unencrypted in browser localStorage**. They do not contain application credentials or the backend API key.
- Changed drafts are copied after roughly 450 ms without edits. The app also attempts a synchronous flush when hidden, leaving the page or unmounting the editor. Browser/OS termination is not guaranteed to deliver these events; the newest keystrokes can still be lost.
- Copies are not cloud backups, studio saves, revision history or an offline-app guarantee. They remain after sign-out and can disappear when browser data is cleared. Deleting a server book does not erase browser storage. Turn recovery off before deleting a book if you want its device copies removed, or clear the site’s browser data.
- Each open editor has its own writer ID so two tabs do not overwrite one another’s recovery records. A successful clean save clears that tab’s copy, not another tab’s branch. Recovered source copies remain until you explicitly discard them.
- Reloading offers copies for review; it never restores or saves them automatically. A whole-book restore is allowed only with a clean editor and a matching saved server revision. The server still performs its authoritative revision check when you subsequently Save.
- An older revision cannot replace the current book wholesale. Review its chapters, download its JSON, or **Add as a new recovered chapter**. Appending uses a new chapter ID, clears stale summary/findings and leaves existing chapters untouched. You must Save afterward. The 100-chapter limit still applies.
- Recovery JSON is a readable full working-copy envelope, **not** the Settings library-backup import format. There is no recovery-file upload/import UI in this release.
- Turning recovery off asks for confirmation, erases only this book’s device copies and communicates the preference to other tabs. **Discard this copy** affects only the selected copy, not studio content.

Storage can be blocked, full or unavailable; copies are capped at 2,000,000 serialized characters and validated against the book schema. If a write fails, the previous copy is retained and a visible warning tells you to Save or download. No other drafts are automatically evicted. A displayed copy time describes the last successful copy, not a guarantee that every current keystroke is protected. Unreadable records are left untouched until you explicitly erase this book’s copies or clear browser data.

## Verification boundary

This upgrade passed six new unit tests and seven new Chromium browser tests, as part of the full 35-unit/pipeline and 20-browser/API suite. Covered: literal/Unicode offsets and limits; save merge; revision/schema/storage rules; focus/navigation/search selection; desktop/mobile axe checks and overflow; opt-in reload/restore; stale copies and new-ID append; delayed and failed saves; quota errors and draft downloads; independent tabs; pagehide flush; cleanup and dialog keyboard trapping.

These are local tests using isolated databases and synthetic content, not a guarantee against browser/OS failure, a full accessibility certification, or live-model quality evidence. No paid API calls or remote deployment were performed.
