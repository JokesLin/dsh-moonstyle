/**
 * Host half of dsh-moonstyle.
 *
 * Deliberately empty: the plugin keeps no state of its own, so it needs no
 * routes, no state file, and no settings namespace. Light / dark / system is
 * persisted by DSH's own `ui-theme.preference` setting, and the token layer
 * itself is a constant compiled into the browser half.
 */
export function apply() {}
