# CRITICAL
1. To avoid the rate limiting thing by github add sleep timer and proxies


# Normal
1. build the Topological Sort (TS) functionality manually and check if any specific optimisations are possible and relevant.
2. `if (len(parent_results)!=NODE_INDEGREE[node.type]):` brainstorm if `node.type` would be better or `processing_fun` would be
3. use `**kwargs` in processing_functions
4. Implement Local storage functionality (to save the `nodes` & **NOT** `nodesWithData` into local/cache storage)
5. Implement Debug LOGGER
6. Integrate Debug Node (`Debug:Display :: head:print`)
7. Optimize ContextMenu.tsx: Combine the two useMemo hooks (filteredActions and grpdActions) into a single useMemo that filters and groups in one pass to improve performance when dealing with large numbers of actions
8. Convert handle color names in `frontend/src/themeConfig.ts` from uppercase color names (BLUE, CYAN, GREEN, PINK, GREY) to CSS variables (var(--handle-color-dataframe), etc.)
9. Add handle color customization to the settings modal to allow users to configure handle colors per data type
