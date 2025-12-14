# Roadmap

This document outlines planned features and improvements for the Tab Quota Chrome Extension.

## Version 1.0.0 (Current)
- ✅ Basic tab quota management
- ✅ Enable/disable toggle
- ✅ Configurable max tabs (10-30)
- ✅ Badge showing remaining quota
- ✅ Auto-close tabs exceeding quota
- ✅ Notification system
- ✅ Suggested close list with smart sorting
- ✅ Switch to tab functionality
- ✅ Bulk close (first 3 tabs)

## Version 1.1.0 (Planned - Q1 2026)

### Whitelist Feature
- [ ] Add domain whitelist functionality
- [ ] Allow specific websites to bypass quota limits
- [ ] UI for managing whitelist entries
- [ ] Import/export whitelist configuration

### Enhanced Statistics
- [ ] Track total tabs opened/closed
- [ ] Display daily/weekly/monthly statistics
- [ ] Show most frequently used domains
- [ ] Tab usage time tracking
- [ ] Visual charts and graphs

### UI Improvements
- [ ] Dark mode support
- [ ] Auto-detect system theme preference
- [ ] Improved popup layout
- [ ] Keyboard shortcuts for common actions
- [ ] Customizable UI colors

## Version 1.2.0 (Planned - Q2 2026)

### Scheduling Features
- [ ] Time-based quota rules
- [ ] Different limits for work hours vs leisure time
- [ ] Weekday/weekend different quotas
- [ ] Custom schedule builder

### Advanced Tab Management
- [ ] Tab grouping support
- [ ] Smart tab suggestions based on usage patterns
- [ ] Duplicate tab detection and removal
- [ ] Memory usage display per tab
- [ ] Sort tabs by memory usage

### Backup & Sync
- [ ] Export settings to file
- [ ] Import settings from file
- [ ] Cloud backup options
- [ ] Settings profiles (work/personal/etc.)

## Version 1.3.0 (Planned - Q3 2026)

### Internationalization
- [ ] Multi-language support
- [ ] Translation framework
- [ ] Languages: English, Chinese (Traditional/Simplified), Japanese, Korean, Spanish, French, German

### Productivity Features
- [ ] Focus mode (auto-close distracting tabs)
- [ ] Reading list integration
- [ ] Tab snooze functionality
- [ ] Session management (save/restore tab sets)
- [ ] Tab templates for common workflows

### Performance Enhancements
- [ ] Faster tab counting algorithm
- [ ] Reduced memory footprint
- [ ] Optimized badge updates
- [ ] Lazy loading for suggested list

## Version 2.0.0 (Future - Q4 2026)

### AI-Powered Features
- [ ] Machine learning for tab usage prediction
- [ ] Intelligent tab closing suggestions
- [ ] Automatic tab categorization
- [ ] Anomaly detection (unusual tab behavior)

### Advanced Analytics
- [ ] Detailed productivity reports
- [ ] Tab usage heatmaps
- [ ] Time spent per domain analysis
- [ ] Distraction tracking

### Integration
- [ ] Browser bookmark integration
- [ ] Task management app integration
- [ ] Note-taking app integration
- [ ] Calendar integration for scheduled limits

### Enterprise Features
- [ ] Team quota policies
- [ ] Centralized management
- [ ] Compliance reporting
- [ ] SSO support

## Community Requests

Features requested by users that we're considering:

- [ ] Tab preview on hover
- [ ] Quick tab search
- [ ] Tab collections
- [ ] Cross-device tab sync
- [ ] Tab sharing functionality
- [ ] Regex-based whitelist patterns
- [ ] Sound/video tab indicators
- [ ] Hibernate tabs instead of closing
- [ ] Custom notification sounds
- [ ] Per-window quota limits

## Technical Debt & Maintenance

### Ongoing
- [ ] Unit test coverage (target: 80%)
- [ ] Integration tests
- [ ] End-to-end testing
- [ ] Performance benchmarking
- [ ] Security audits
- [ ] Code refactoring for maintainability
- [ ] Documentation improvements
- [ ] Accessibility improvements (WCAG 2.1 AA)

### Known Issues to Address
- [ ] Handle rapid tab opening more gracefully
- [ ] Improve notification timing
- [ ] Better handling of suspended tabs
- [ ] Optimize for low-end devices

## Contribution

We welcome contributions! If you'd like to work on any of these features:

1. Check the [GitHub Issues](https://github.com/tanghoong/chrome-ext-tabquota/issues) for existing discussions
2. Open a new issue to discuss your idea
3. Fork the repository and create a pull request
4. Ensure your code follows the existing style and patterns

## Feedback

Have suggestions for the roadmap? Please:
- Open an issue on GitHub
- Tag it with "enhancement" or "feature-request"
- Describe the feature and its use case
- Explain how it would benefit users

---

**Note**: This roadmap is subject to change based on user feedback, technical constraints, and development priorities. Dates are estimates and may be adjusted.

**Last Updated**: December 2025
