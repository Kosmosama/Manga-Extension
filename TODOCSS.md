## Main page UI Hover Effects
- Add hover effects to the following elements:
  - **Favourite**
  - **Delete**
  - **Title**
  - **"-" and "+" signs**
  - **Settings wheel**

## Input Styles
- Change the **focus color** of all inputs (currently blue) to `#border`.

## Fix height and width
- Add a min/max for the whole width and height of the extension so that, if less mangas appear, the height doesn't change.

## Add Manga button
- Add a **fixed position** to the **AddManga button**.
- Set the button's background color to `#highlight-primary`.
- Change the text color to `#highlight-text`.

## Search Bar
- Fix the **"X" button hover** in the search bar (it currently extends beyond the search bar border).

## Borders
- Change **ALL borders' color** to `#border`.

## Drag and Drop (remove or do the following)
- Add a **hover effect** to the drag-and-drop area from the **Import from file** button to highlight the drop zone.
- Add a small **left margin** to the "or drag and drop" text.
- Change the **"drag and drop" text color** to `#secondary-text`.

## Consistency
- Ensure that the **title size** for the settings and filter boxes titles are the **same as** the **Import/Export** box title.
- Update the **checkbox** in the Add Manga form to match the design of checkboxes used in the **filters**.
- Remove unnecessary **padding/margin** for options in the **Language select** and **Theme select** in the **Settings** dialog.
- Make all **"X" buttons** consistent in design across the UI.
  - Add a hover effect to them for feedback.

## Padding and Margins
- Apply the **same padding/margin** to the **Filter** title in its dialog as used in the **Settings** title.

## Dropdowns
- **Update styles** for all dropdowns (similar to those in v0 if possible).

## Add Manga Form
- Change the **"Save" button color** in the Add Manga form to **black** (same as the AddManga button).
- Add a **hover effect** to both **"Cancel"** and **"Save" buttons** in the Add Manga form.
- Add slight **padding/margin** to options (in between them) in the Add Manga form for better spacing.

## Main page details
- Implement a **visual style** similar to what was done in `v0.dev ver18` for the scroll (referring to [this image](https://imgur.com/a/zTzK8PZ)).
**(REMEMBER, VERSION 18)**
- Ensure the shadow/blur doesn't expand to cover the margins ([like this](https://imgur.com/a/uj6A6NL)).

## Bookmark Import
- Implement a **visual style** similar to what was done in `v0.dev ver18` **(REMEMBER, VERSION 18)**

## Settings & Filters Form Error
- Fix the error where, after closing and reopening the **Settings** or **Filters form**, the scroll position is maintained.
  - **Reset the form's scroll position** to the top when it is reopened (like restarting the dialog).

## Colors
#### Light Mode
```css
light-mode {
    primary: #FFFFFF, /* cards */
    secondary: #F5F5F5, /* background */
    primary-text: #191919, /* all which isn't secondary */
    secondary-text: #A1A1A1, /* For dates and drag and drop text */
    border: #E5E5E5, /* All borders + focus of inputs */
    red: #EB2828, /* For eliminate and trash can */
    highlight-primary: #191919, /* For like add manga button background */
    highlight-text: #FFFFFF; /* Text color on highlighted elements */
}
```

#### Dark Mode
```css
dark-mode {
	primary: #2D2D2D, /* cards */
	secondary: #191919, /* background */
	primary-text: #FFFFFF, /* all which isn't secondary */
	secondary-text: #717171, /* for dates and "drag and drop" text */
	border: #474747, /* All borders + focus of inputs */
	red: #800101, /* For eliminate and trash can */
	highlight-primary: #FFFFFF, /* For like add manga button background */
	highlight-text: #191919; /* Text color on highlighted elements */
}
```