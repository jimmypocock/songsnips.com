# TODO List

## Quick Win Implementation Strategy

Based on competitive analysis of 15+ YouTube looping tools, these 5 improvements can each be implemented in under a day and will significantly enhance the musician experience:

1. **Keyboard Shortcuts** (2-3 hrs) - Immediate impact on daily usability
2. **Granular Speed Control** (2-3 hrs) - Core musician need
3. **Loop Memory** (4-5 hrs) - Transforms user retention
4. **Visual Loop Preview** (3-4 hrs) - Solves biggest frustration
5. **Mobile Touch Gestures** (3-4 hrs) - Expands accessibility

**Total Implementation Time**: ~16-20 hours (2-3 days for one developer)

## Priority Levels

- **P0** - Critical: Must be done immediately
- **P1** - High: Should be done soon
- **P2** - Medium: Nice to have
- **P3** - Low: Future considerations

## Categories

- **UI/UX** - User interface and experience improvements
- **Infrastructure** - Backend, deployment, and system architecture
- **Features** - New functionality and capabilities
- **Monetization** - Revenue generation and optimization
- **Documentation** - Code documentation and user guides

---

### P0 - Critical

#### **Testing** - Set Up Professional Test Suite
- [ ] Set up testing framework (Vitest + React Testing Library + Cypress)
  - [ ] Install and configure Vitest for unit/component tests
  - [ ] Set up React Testing Library for component testing
  - [ ] Configure Cypress for E2E testing
  - [ ] Add test scripts to package.json
  - [ ] Create test utilities and mock helpers
  - **Rationale**: Application currently has zero test coverage. Testing is critical for reliability and preventing regressions.

### P1 - High Priority

#### **Testing** - Core Hook Tests
- [ ] Write unit tests for useYouTubePlayer hook
  - [ ] Test player initialization and state management
  - [ ] Test looping logic (start/end time enforcement)
  - [ ] Test playback control methods (play, pause, seek)
  - [ ] Test time tracking with intervals
  - [ ] Test cleanup on unmount
  - **Coverage Target**: 95%+ for this critical hook

- [ ] Write unit tests for useLoopMemory hook
  - [ ] Test localStorage read/write operations
  - [ ] Test loop CRUD operations (add, update, delete)
  - [ ] Test migration from old storage format
  - [ ] Test edge cases (storage full, invalid data)
  - [ ] Test SSR compatibility (no localStorage on server)
  - **Coverage Target**: 95%+ for data persistence logic

#### **Testing** - Critical Component Tests
- [ ] Write component tests for YouTubePlayer
  - [ ] Test YouTube API script loading (success/failure)
  - [ ] Test player initialization with different states
  - [ ] Test error handling (blocked videos, network errors)
  - [ ] Test mobile-specific iframe handling
  - [ ] Mock window.YT global object
  - **Coverage Target**: 95%+ for API integration

- [ ] Write component tests for Timeline
  - [ ] Test mouse drag interactions for loop points
  - [ ] Test touch interactions for mobile
  - [ ] Test time calculations and formatting
  - [ ] Test constraint enforcement (min/max positions)
  - [ ] Test visual feedback during interactions
  - **Coverage Target**: 95%+ for interaction logic


### P2 - Medium Priority

#### **Testing** - Integration & Service Tests
- [ ] Write unit tests for searchService
  - [ ] Test API request/response handling
  - [ ] Test quota checking logic
  - [ ] Test error scenarios (network, API errors)
  - [ ] Test response caching
  - [ ] Mock fetch API calls
  - **Coverage Target**: 90%+ for API communication

- [ ] Write integration tests for keyboard shortcuts
  - [ ] Test all keyboard combinations
  - [ ] Test modifier key handling
  - [ ] Test focus management
  - [ ] Test accessibility compliance
  - [ ] Test cross-browser compatibility
  - **Coverage Target**: 100% of shortcuts

- [ ] Write integration tests for SongSnips component
  - [ ] Test URL parameter handling (video ID extraction)
  - [ ] Test component initialization flow
  - [ ] Test state synchronization between components
  - [ ] Test error boundaries
  - [ ] Test loading states
  - **Coverage Target**: 90%+ for main component

- [ ] Write E2E tests for critical user flows
  - [ ] Test complete flow: search → load video → create loop → save loop
  - [ ] Test returning user: load saved loops → select loop → practice
  - [ ] Test sharing: create loop → share URL → load shared loop
  - [ ] Test mobile experience on different devices
  - [ ] Test error recovery flows
  - **Tools**: Cypress with real YouTube video (https://www.youtube.com/watch?v=8inJtTG_DuU)


### P2.5 - Security & Production Fixes


### P3 - Low Priority

#### **Testing** - Additional Test Coverage
- [ ] Write tests for mobile touch interactions
  - [ ] Test Timeline touch drag behavior
  - [ ] Test pinch/zoom gestures
  - [ ] Test responsive breakpoints
  - [ ] Test iOS/Android specific behaviors
  - [ ] Test performance on low-end devices
  - **Coverage Target**: 90%+ for touch handlers

- [ ] Write unit tests for utility functions
  - [ ] Test formatTime function with edge cases
  - [ ] Test extractVideoId with various URL formats
  - [ ] Test debounce/throttle implementations
  - [ ] Test error formatting utilities
  - **Coverage Target**: 100% for pure functions

- [ ] Write component tests for SpeedControl
  - [ ] Test preset button interactions
  - [ ] Test custom speed input validation
  - [ ] Test speed persistence
  - [ ] Test keyboard navigation
  - **Coverage Target**: 95%+ for UI logic

- [ ] Write performance tests
  - [ ] Test Timeline rendering performance with long videos
  - [ ] Test memory usage during extended sessions
  - [ ] Test loop timing accuracy
  - [ ] Benchmark state update frequency
  - **Tools**: React DevTools Profiler, Performance API

- [ ] Write accessibility tests
  - [ ] Test screen reader compatibility
  - [ ] Test keyboard-only navigation
  - [ ] Test color contrast ratios
  - [ ] Test ARIA labels and roles
  - **Tools**: jest-axe, Cypress Axe

#### **UI/UX** - Mobile-First Touch Gestures (3-4 hours)

- [ ] Add horizontal swipe for timeline scrubbing
- [ ] Add vertical swipe for speed control
- [ ] Increase touch target sizes for mobile (minimum 44x44px)
- [ ] Optimize button placement for thumb reach
- [ ] Test on various mobile devices/screen sizes
- **Rationale**: Mobile optimization crucial for students without desktop access, but current functionality already works on mobile.

#### **Documentation** - Competitive Differentiation

- [ ] Document unique value proposition vs competitors (LoopTube, RepeatTube, Looper.tube)
- [ ] Create comparison chart highlighting SongSnips advantages
- [ ] Add testimonials/use cases from musicians

#### **Features** - Future Considerations

- [ ] Multiple loops per video (competitors offer this)
- [ ] Shareable loop URLs with embedded start/end times
- [ ] Practice history/analytics (loops completed, time practiced)
- [ ] Integration with music learning platforms
- [ ] Offline capability with service workers

---

## Market Insights (from Competitive Analysis)

### Competitor Strengths to Consider

- **LoopTube**: Market leader, emphasizes "free" and simple AB loop
- **RepeatTube**: Focus on playlists and simplicity
- **YouTube Looper Extension**: Very precise speed rates (0.7, 0.85)
- **Vidami Pedal**: Hardware solution shows demand for hands-free control

### Key Success Metrics

- Loop setup time (target: under 5 seconds)
- Time to first loop (reduce friction)
- Return user rate (loop memory crucial)
- Mobile usage percentage
- Average practice session length

---

## Testing Strategy Summary

### Test Coverage Goals
- **Overall Coverage Target**: 90%+
- **Critical Components**: 95%+ (useYouTubePlayer, Timeline, useLoopMemory, YouTubePlayer)
- **API Integration**: 90%+ (searchService)
- **UI Components**: 90%+ (focus on interaction logic)
- **Utility Functions**: 100% (pure functions)

### Testing Priorities
1. **Unit Tests First**: Start with hooks and utilities (fastest ROI)
2. **Component Tests**: Test critical components in isolation
3. **Integration Tests**: Test component interactions and workflows
4. **E2E Tests**: Test complete user journeys with real YouTube videos

### Key Testing Challenges & Solutions
1. **YouTube API Mocking**
   - Create comprehensive mock for window.YT object
   - Test various player states and events
   - Handle async script loading scenarios

2. **LocalStorage Testing**
   - Mock localStorage for Node.js environment
   - Test storage limits and error cases
   - Ensure SSR compatibility

3. **Timer/Interval Testing**
   - Use Vitest fake timers for predictable tests
   - Test loop timing accuracy
   - Verify cleanup on unmount

4. **Touch/Mouse Events**
   - Use React Testing Library's user-event
   - Test drag interactions with proper event sequences
   - Verify touch and mouse behavior parity

### Testing Tools Stack
- **Vitest**: Fast unit and component testing framework for Vite/Next.js
- **React Testing Library**: Component testing with user-centric approach
- **Cypress**: E2E testing with real browser environment
- **MSW**: Mock Service Worker for API mocking
- **jest-axe**: Accessibility testing
- **@testing-library/user-event**: Realistic user interactions

### CI/CD Integration
- Run tests on every PR
- Block merges if coverage drops below thresholds
- Generate coverage reports
- Run E2E tests on staging deployments

## Completed

### Features
- [x] **Keyboard Shortcuts (2-3 hours)** ✅ - P1
  - [x] Implement spacebar for play/pause
  - [x] Add 'A' key to set loop start marker
  - [x] Add 'B' key to set loop end marker
  - [x] Add left/right arrow keys for 5-second skip
  - [x] Add up/down arrow keys for speed adjustment
  - [x] Add visual keyboard shortcut guide/overlay
  - **Rationale**: Lowest effort, highest impact on daily usability. Musicians can control playback without taking hands off their instrument.

- [x] **Granular Speed Control (2-3 hours)** ✅ - P1
  - [x] Replace current slider with preset speed buttons (25%, 50%, 75%, 85%, 100%)
  - [x] Add fine-tune input field for custom speed values (e.g., 0.7, 0.85)
  - [x] Ensure speed persists when loop restarts
  - **Rationale**: Musicians need precise speed control for progressive practice methodology.

- [x] **Loop Memory with Browser Storage (4-5 hours)** ✅ - P2
  - [x] Implement localStorage to save up to 10 recent loops per video
  - [x] Add visual indicators on timeline for saved loops
  - [x] Create UI for selecting/deleting saved loops
  - [x] Auto-save current loop when user leaves page
  - [x] Display saved loops when returning to same video
  - **Rationale**: Users want to instantly return to practiced sections across sessions without manually finding them again.

- [x] **Visual Loop Preview Mode (3-4 hours)** ✅ - P2
  - [x] Add preview mode toggle button
  - [x] When adjusting end marker, auto-loop last 2-3 seconds before marker
  - [x] Visual indicator showing preview mode is active
  - [x] Auto-exit preview mode when markers are confirmed
  - **Rationale**: Eliminates frustration of listening through entire loops to verify end points, making practice setup 5x faster.

### Infrastructure
- [x] **YouTube Search API Backend (8-10 hours)** ✅ - P1
  - [x] Phase 1: AWS Infrastructure Setup (3-4 hours) ✅
    - [x] Create new API CDK stack (api-stack.ts)
    - [x] Set up API Gateway REST API with CORS
    - [x] Create Lambda functions for search and quota status
    - [x] Set up DynamoDB table for quota tracking
    - [x] Configure AWS Secrets Manager for YouTube API key
    - [x] Update CDN stack to add /api/* behavior (cdn-stack-v2.ts ready, needs integration)
    - [x] Set up CloudWatch monitoring and alarms
  - [x] Phase 2: Backend Implementation (2-3 hours) ✅
    - [x] Implement search Lambda with YouTube API v3 integration
    - [x] Add quota checking and tracking logic
    - [x] Implement quota status endpoint
    - [x] Add search result caching in DynamoDB
    - [x] Set up automatic quota reset at midnight PT
    - [x] Add error handling and logging
  - [x] Phase 3: Frontend Integration (3-4 hours) ✅
    - [x] Create SearchService class for API communication
    - [x] Replace URL input with search bar UI
    - [x] Add search results display component
    - [x] Implement quota status indicator
    - [x] Add fallback "Search on YouTube" button
    - [x] Cache recent searches in localStorage
    - [x] Add loading states and error handling
  - **Rationale**: Eliminates friction of switching to YouTube to find videos. Automatic quota management ensures reliable service.

- [x] **Tighten CORS Policy for Production** ✅ - P2.5
  - [x] Replace wildcard (*) CORS origin with specific allowed domains in Lambda functions
  - [x] Update Lambda functions to check origin header properly
  - [x] Add environment-based CORS configuration
  - [x] Test CORS with production domain
  - **Current State**: API Gateway has proper CORS, and Lambda functions now validate origins
  - **Risk**: ~~Allows any website to call your API and use your quota~~ FIXED
  - **Fix**: ~~Update both Lambda functions to use specific origins~~ COMPLETED

### Other
- [x] **[Add sitemap]**  `[TODO-001]` ✓ 2025-06-05
