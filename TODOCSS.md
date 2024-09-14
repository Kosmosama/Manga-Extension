## UI Hover Effects
- Add hover effects to the following elements:
  - **Favourite**
  - **Delete**
  - **Title**
  - **"-" and "+" signs**
  - **Settings wheel**

## Input Styles
- Change the **focus color** of all inputs (currently blue) to `#border`.

## Button Styles
- Add a **fixed position** to the **AddManga button**.
  - Set the button's background color to **black**.
  - Change the text color.

## Search Bar
- Fix the **"X" button hover** in the search bar (it currently extends beyond the search bar border).

## Borders
- Change **ALL borders' color** to `#border`.

## Drag and Drop
- Add a **hover effect** to the drag-and-drop area from the **Import button** to highlight the drop zone.
- Add a small **left margin** to the "or drag and drop" text.
- Change the **"drag and drop" text color** to `#1`.

## Titles
- Ensure that the **title size** for the settings and filter boxes is the **same as** the **Import/Export** title.

## Padding and Margins
- Apply the **same padding/margin** to the **Filter text** as used in the settings text.

## Dropdowns
- **Update styles** for all dropdowns for consistency.

## Add Manga Form
- Update the **checkbox** in the Add Manga form to match the design of checkboxes used in the **filters**.
- Remove unnecessary **padding/margin** for options in the **Language select** and **Theme select**.
- Change the **"Save" button color** in the Add Manga form to **black** (same as the AddManga button).
- Add a **hover effect** to both **"Cancel"** and **"Save" buttons** in the Add Manga form.
- Add slight **padding/margin** to options in the Add Manga form for better spacing.

## Consistent "X" Buttons
- Make all **"X" buttons** consistent in design across the UI.
  - Add a hover effect to each one for feedback.

## Bookmark Import
- Implement a **visual style** similar to what was done in **v0.18** for Import Bookmarks (referring to [this image](https://imgur.com/a/zTzK8PZ)).
  - Ensure the shadow doesn't expand to cover the margins ([see reference](https://imgur.com/a/uj6A6NL)).

## Settings & Filters Form Error
- Fix the error where, after closing and reopening the **Settings** or **Filters form**, the scroll position is maintained.
  - **Reset the form's scroll position** to the top when it is reopened (like restarting the form).

## Colors
#### Light Mode
```css
light-mode {
    primary: #FFFFFF; /* cards */
    secondary: #F5F5F5; /* background */
    primary-text: #191919; /* all which isn't secondary */
    secondary-text: #A1A1A1; /* for dates and "drag and drop" text */
    border: #E5E5E5; /* All borders + focus of inputs */
    red: #EB2828; /* For eliminate and trash can */
    highlight-primary: #191919; /* For like add manga button background */
    highlight-text: #FFFFFF; /* Text color on highlighted elements */
}
```

#### Dark Mode
```css
dark-mode {
	primary: #2D2D2D, /* cards */
	secondary: #191919, /* background */
	primary-text: #FFFFFF, /* all which isn't secondary 
	secondary-text: #717171, /* for dates and "drag and drop" text */
	border: #474747, /* All borders + focus of inputs */
	red: #800101, /* For eliminate and trash can */
	highlight-primary: #FFFFFF, /* For like add manga button background */
	highlight-text: #191919; /* Text color on highlighted elements */
}
```