---
'@simbo/git-changes': major
---

Fix and extend how Git changes are read and parsed.

- Renamed and copied files are now reported with the new path as `path` and the
  original path as `originPath`. Previously, both paths were swapped.
- Untracked directories are now reported as individual files instead of a single
  `dir/` entry, also when `status.showUntrackedFiles` is configured otherwise.
- Add `GitChangeStatus.TypeChanged` (`T`) for files whose type changed, such as
  a file replaced by a symlink. These files were previously missing.
- Add `GitChangeStatus.Unmerged` (`U`) for files with merge conflicts. Both
  `staged` and `unstaged` are set to `Unmerged`. These files were previously
  missing, and files added or deleted on both sides were reported as `Added` or
  `Deleted`.

To migrate, remove workarounds that swap `path` and `originPath` or expand
untracked directories, and handle the new statuses where you check all status
values.
