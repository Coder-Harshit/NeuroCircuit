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



-----

# NEW
- [x] setting community and private node status. If node created via forge is community node then it would be synced to the cloud and made available to everyone else its just a local thing ... also this change would be reflected into the package (node) manager.
  
- [x] API for code generation along if ollama isnt there
  
- [x] Add (NERD) icons to the top bar
- [x] Set the options ( Icons+Text, Text Only , Icons Only ) in the prefernece settings for the top bar
- [x] Uninstall Node (from node manager), removes them completely (ALL relevant LOCAL FILES)
- [ ] Implement debug pipepline
- [ ] Run pipeline would highlight each node being executed for whatever real time they are being executed.