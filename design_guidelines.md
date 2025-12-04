# Travel Management System - Design Guidelines

## Design Approach: Utility-First Booking Platform

**Selected Framework**: Tailwind + shadcn/ui component patterns
**Inspiration**: RedBus, MakeMyTrip, GoIbibo (functional booking platforms)
**Core Principle**: Clear information hierarchy, efficient task completion, trust-building design

---

## Typography System

**Font Family**: Inter (via Google Fonts CDN) - excellent readability for data-heavy interfaces

**Hierarchy**:
- Page Titles: text-3xl font-bold (Bus Search, My Bookings)
- Section Headers: text-xl font-semibold (Available Buses, Seat Selection)
- Bus Names/Routes: text-lg font-medium
- Body Text: text-base font-normal (descriptions, details)
- Meta Info: text-sm (times, dates, seat numbers)
- Helper Text: text-xs (form hints, fine print)

---

## Layout System

**Spacing Units**: Tailwind 4, 6, 8, 12, 16 units
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card margins: gap-4 for grids
- Form fields: space-y-4

**Container Strategy**:
- Max width: max-w-7xl mx-auto for main content
- Full-width for search bars and filters
- Cards: Contained width with proper breathing room

---

## Component Library

### Search Interface
**Hero Search Panel**:
- Prominent search form at top (not full viewport height)
- Horizontal layout on desktop (From | To | Date | Passengers)
- Vertical stack on mobile
- Large, accessible input fields with clear labels
- Prominent "Search Buses" CTA button

### Bus Listing Cards
**Structure** (each bus result):
- Bus operator name + rating (text-lg font-semibold)
- Departure/arrival times + duration (text-base)
- Bus type badge (AC/Non-AC, Sleeper/Seater)
- Available seats indicator
- Price (text-2xl font-bold, right-aligned)
- "View Seats" button (right-aligned)
- Amenities icons row (WiFi, charging, etc. - use Heroicons)

**Layout**: List view (not grid) - one card per row with full details visible

### Seat Selection Interface
**Grid Layout**:
- Visual seat map with clear lower/upper deck tabs
- Seat represented as clickable boxes in grid
- Legend: Available/Selected/Booked/Female (use patterns/borders, not colors)
- Seat type indicators: Window/Aisle positions
- Running price calculator (sticky sidebar on desktop)

### Booking Summary Panel
**Fixed Sidebar** (desktop) / **Bottom Sheet** (mobile):
- Journey details recap
- Selected seats with pricing breakdown
- Total amount (prominent)
- Passenger details form
- Payment CTA

### User Dashboard
**Tab Navigation**: My Bookings | Profile | Payment Methods
**Booking Cards**: Timeline view showing upcoming/past journeys
- Ticket number + status badge
- Route + date/time
- Seat numbers
- Download/View ticket action

---

## Navigation

**Header**:
- Logo (left)
- Main nav: Search Buses | My Bookings (center/left)
- User menu dropdown with avatar (right)
- Login/Signup buttons (when logged out)

**Mobile**: Hamburger menu with full-screen overlay

---

## Form Design

**Input Fields**:
- Clear labels above inputs
- Placeholder text for format guidance
- Icons inside inputs for search/date fields (Heroicons)
- Error states with red border + error message below
- Success states with checkmark icon

**Date Picker**: Custom calendar widget (not native) for better UX
**Dropdown Selects**: Custom styled with chevron icons

---

## Trust Elements

**Throughout Platform**:
- Security badge near payment section
- "Safe & Secure" indicator
- Customer support contact (header/footer)
- Ratings and reviews for operators
- Verified operator badges

---

## Icons

**Library**: Heroicons (via CDN)
**Usage**:
- Navigation items
- Amenity indicators (wifi, charging, blanket, water)
- Status indicators (confirmed, pending, cancelled)
- Calendar, clock, location pins for travel details
- User profile, settings, logout

---

## Responsive Behavior

**Desktop (lg:)**:
- Two-column layout: filters sidebar + results
- Horizontal search form
- Side-by-side seat map + booking summary

**Tablet (md:)**:
- Stacked filters (collapsible)
- Full-width search
- Seat map full width, summary below

**Mobile (base)**:
- Vertical search inputs
- Filter button opens modal
- Single column everything
- Bottom sticky booking summary bar

---

## Animations

**Minimal & Purposeful**:
- Smooth transitions on seat selection (100ms)
- Loading skeleton screens for bus search results
- Slide-in for mobile filter drawer
- Fade-in for success confirmations
**No decorative animations**

---

## Images

**Not Required** for this functional platform. Focus on:
- Clean iconography for amenities
- Seat map visualization
- Placeholder avatars for user profiles
- Trust badges/security seals (SVG)

**Hero Section**: No large hero image - lead with functional search form immediately

---

## Accessibility

- All interactive elements have sufficient click targets (min 44×44px)
- Form inputs have associated labels
- Seat selection grid navigable via keyboard
- Error messages announced to screen readers
- Focus indicators on all interactive elements
- Consistent tab order through booking flow

---

This design prioritizes **speed, clarity, and conversion** - getting users from search to booked ticket with minimal friction while building trust through professional, data-rich presentation.