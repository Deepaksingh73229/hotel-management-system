hotel-management-system/                  ← repo root
├── app/                                  ← Next.js App Router
│   │
│   ├── (auth)/                           ← Route group — no sidebar layout
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx                    ← Auth layout (centered card, no sidebar)
│   │
│   ├── (dashboard)/                      ← Route group — has sidebar layout
│   │   ├── layout.tsx                    ← ERP Shell: Sidebar + Topbar + <children/>
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── reservations/
│   │   │   ├── page.tsx                  ← List view
│   │   │   ├── new/
│   │   │   │   └── page.tsx             ← Create reservation form
│   │   │   └── [id]/
│   │   │       ├── page.tsx             ← Detail view
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── rooms/
│   │   │   ├── page.tsx                  ← Room grid / housekeeping view
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── guests/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── billing/
│   │   │   ├── page.tsx                  ← Folios list
│   │   │   └── [folioId]/
│   │   │       └── page.tsx             ← Folio detail + charges + payments
│   │   │
│   │   ├── reports/
│   │   │   ├── page.tsx                  ← Reports landing (cards grid)
│   │   │   ├── occupancy/
│   │   │   │   └── page.tsx
│   │   │   ├── revenue/
│   │   │   │   └── page.tsx
│   │   │   ├── arrivals-departures/
│   │   │   │   └── page.tsx
│   │   │   └── night-audit/
│   │   │       └── page.tsx
│   │   │
│   │   ├── staff/                        ← Admin only
│   │   │   ├── page.tsx                  ← User list
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── audit-logs/                   ← Admin only
│   │   │   └── page.tsx
│   │   │
│   │   └── settings/                     ← Admin only
│   │       ├── page.tsx                  ← Property settings
│   │       ├── roles/
│   │       │   └── page.tsx
│   │       └── rate-plans/
│   │           └── page.tsx
│   │
│   ├── api/                              ← Next.js route handlers (BFF / proxy layer)
│   │   └── health/
│   │       └── route.ts
│   │
│   ├── globals.css
│   ├── layout.tsx                        ← Root layout (html, body, providers)
│   └── not-found.tsx
│
│
├── components/                           ← All React components
│   │
│   ├── ui/                               ← shadcn/ui primitives (DO NOT edit manually)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   │
│   ├── layout/                           ← Shell / structural components
│   │   ├── Sidebar.tsx                   ← Collapsible sidebar, nav items, role-aware
│   │   ├── SidebarItem.tsx               ← Single nav item (icon + label + active state)
│   │   ├── Topbar.tsx                    ← Page title, breadcrumb, search, theme toggle
│   │   ├── UserMenu.tsx                  ← Avatar, role badge, logout dropdown
│   │   └── ThemeToggle.tsx               ← Light/dark switcher
│   │
│   ├── common/                           ← Reusable across all features
│   │   ├── PageHeader.tsx                ← Title + subtitle + optional action button
│   │   ├── DataTable.tsx                 ← Generic sortable/paginated table
│   │   ├── StatusBadge.tsx               ← Color-coded status pill
│   │   ├── KpiCard.tsx                   ← Dashboard metric card
│   │   ├── EmptyState.tsx                ← Illustration + message for empty lists
│   │   ├── ErrorState.tsx                ← Error boundary UI
│   │   ├── LoadingSkeleton.tsx           ← Skeleton screens
│   │   ├── ConfirmDialog.tsx             ← "Are you sure?" modal for destructive actions
│   │   ├── SearchInput.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── FilterBar.tsx                 ← Generic filter strip (pills + dropdowns)
│   │   └── CopyButton.tsx                ← Copy-to-clipboard for IDs/ref numbers
│   │
│   ├── dashboard/
│   │   ├── OccupancyGrid.tsx             ← Visual room tile map
│   │   ├── RoomTile.tsx                  ← Single room tile (color by status)
│   │   ├── ArrivalsWidget.tsx
│   │   ├── DeparturesWidget.tsx
│   │   ├── QuickActions.tsx
│   │   ├── ShiftSummaryCard.tsx
│   │   └── RevenueChart.tsx
│   │
│   ├── reservations/
│   │   ├── ReservationTable.tsx
│   │   ├── ReservationDrawer.tsx         ← Slide-in detail panel
│   │   ├── ReservationForm.tsx           ← Create / edit form
│   │   ├── ReservationStatusStepper.tsx  ← Timeline: Confirmed→Checked In→etc
│   │   ├── GuestSelector.tsx             ← Search + select guest in form
│   │   ├── RoomTypeSelector.tsx
│   │   └── ReservationFilters.tsx
│   │
│   ├── rooms/
│   │   ├── RoomGrid.tsx                  ← Floor-grouped grid
│   │   ├── FloorSection.tsx              ← One floor's room tiles
│   │   ├── RoomCard.tsx                  ← Detailed room card (drawer/modal)
│   │   ├── RoomStatusLegend.tsx
│   │   └── HousekeepingFilters.tsx
│   │
│   ├── guests/
│   │   ├── GuestTable.tsx
│   │   ├── GuestProfileHeader.tsx        ← Avatar, tags, contact
│   │   ├── GuestStayHistory.tsx
│   │   ├── GuestPreferences.tsx
│   │   ├── GuestForm.tsx
│   │   └── GuestTagBadge.tsx             ← VIP / Blacklisted / Repeat chips
│   │
│   ├── billing/
│   │   ├── FolioTable.tsx
│   │   ├── FolioDetail.tsx
│   │   ├── ChargesLedger.tsx
│   │   ├── PaymentsLedger.tsx
│   │   ├── FolioSummaryFooter.tsx        ← Subtotal/tax/balance receipt strip
│   │   ├── PostChargeForm.tsx
│   │   ├── AddPaymentForm.tsx
│   │   └── InvoicePreview.tsx
│   │
│   ├── staff/
│   │   ├── StaffTable.tsx
│   │   ├── InviteStaffForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── RoleBadge.tsx
│   │
│   ├── audit/
│   │   ├── AuditLogList.tsx
│   │   ├── AuditLogEntry.tsx             ← Expandable row with diff view
│   │   └── AuditDiffViewer.tsx           ← Prev vs New value side-by-side
│   │
│   └── reports/
│       ├── ReportCard.tsx                ← Landing page clickable tile
│       ├── OccupancyReport.tsx
│       ├── RevenueReport.tsx
│       └── ReportFilters.tsx
│
│
├── services/                             ← ★ ALL API CALLS LIVE HERE ★
│   │
│   ├── api/
│   │   └── client.ts                     ← Axios/fetch instance: baseURL, interceptors,
│   │                                       auth header injection, token refresh on 401,
│   │                                       error normalization
│   │
│   ├── auth.service.ts                   ← login, logout, refreshToken, forgotPassword, etc.
│   ├── user.service.ts                   ← getAllUsers, getUserById, updateUser, etc.
│   ├── reservation.service.ts
│   ├── room.service.ts
│   ├── guest.service.ts
│   ├── billing.service.ts                ← folio, charges, payments
│   ├── invoice.service.ts
│   ├── report.service.ts
│   ├── audit.service.ts
│   └── property.service.ts
│
│
├── hooks/                                ← Custom React hooks (data fetching + UI state)
│   │
│   ├── auth/
│   │   ├── useAuth.ts                    ← Current user, login, logout
│   │   └── usePermission.ts              ← hasRole(), canDo() checks
│   │
│   ├── reservations/
│   │   ├── useReservations.ts            ← List with filters/pagination
│   │   ├── useReservation.ts             ← Single by ID
│   │   └── useReservationMutations.ts    ← create, update, cancel, checkIn, checkOut
│   │
│   ├── rooms/
│   │   ├── useRooms.ts
│   │   └── useRoomStatus.ts
│   │
│   ├── guests/
│   │   ├── useGuests.ts
│   │   └── useGuest.ts
│   │
│   ├── billing/
│   │   ├── useFolio.ts
│   │   ├── useCharges.ts
│   │   └── usePayments.ts
│   │
│   ├── staff/
│   │   └── useUsers.ts
│   │
│   └── ui/
│       ├── useSidebar.ts                 ← Collapse state, persisted in localStorage
│       ├── useToast.ts                   ← Wrapper around shadcn toast
│       └── useConfirm.ts                 ← Programmatic confirm dialog
│
│
├── stores/                               ← Global client state (Zustand)
│   ├── auth.store.ts                     ← accessToken, user, isAuthenticated
│   ├── sidebar.store.ts                  ← isCollapsed
│   └── theme.store.ts                    ← 'light' | 'dark', persisted
│
│
├── types/                                ← TypeScript interfaces (mirror your backend models)
│   ├── auth.types.ts                     ← LoginPayload, AuthUser, TokenResponse
│   ├── user.types.ts                     ← User, Role, Permission
│   ├── reservation.types.ts              ← Reservation, ReservationStatus
│   ├── room.types.ts                     ← Room, RoomType, RoomStatus, RoomBlock
│   ├── guest.types.ts                    ← Guest, GuestTag
│   ├── billing.types.ts                  ← Folio, FolioCharge, Payment
│   ├── invoice.types.ts
│   ├── report.types.ts
│   ├── audit.types.ts
│   ├── property.types.ts
│   └── api.types.ts                      ← ApiResponse<T>, PaginatedResponse<T>,
│                                           ApiError, PaginationMeta
│
│
├── lib/                                  ← Pure utilities, no React, no API calls
│   ├── utils.ts                          ← cn(), formatCurrency, formatDate (shadcn default)
│   ├── constants.ts                      ← ROOM_STATUSES, RESERVATION_STATUSES, ROLES, etc.
│   ├── formatters.ts                     ← formatINR(), formatDate(), formatPhone()
│   ├── validators.ts                     ← Zod schemas for forms (mirrors backend validators)
│   └── permissions.ts                    ← ROLE_PERMISSIONS map, canAccess() helper
│
│
├── config/                               ← App-level configuration
│   ├── env.ts                            ← Typed process.env access with validation
│   ├── navigation.ts                     ← Sidebar nav items config (icon, label, href, roles)
│   └── queryClient.ts                    ← TanStack Query client config (staleTime, retry, etc.)
│
│
├── providers/                            ← React context providers (wrap in root layout)
│   ├── AuthProvider.tsx                  ← Token init, user hydration on app load
│   ├── QueryProvider.tsx                 ← TanStack Query <QueryClientProvider>
│   ├── ThemeProvider.tsx                 ← next-themes wrapper
│   └── ToastProvider.tsx                 ← Sonner or shadcn Toaster
│
│
├── assets/                               ← Static assets
│   ├── icons/                            ← Custom SVG icons (if any beyond lucide)
│   └── images/
│       └── login-bg.jpg
│
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── .env.local                            ← NEXT_PUBLIC_API_URL=http://localhost:4000
├── .env.example                          ← Committed — shows required vars, no values
├── components.json                       ← shadcn/ui config
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── tailwind.config.ts
├── pnpm-workspace.yaml
└── package.json