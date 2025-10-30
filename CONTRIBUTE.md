# CONTIBUTION 🤝
While Creating any new Node Component make sure ***ALL*** of the Following requirements are fullfiled for your desired **Node Component**
## FRONTEND
- [ ] Frontend Node Component created in [`nodes dir.`](frontend/src/components/nodes)
- [ ] Node Component Registered in [`nodeRegistry.ts`](frontend/src/components/nodes/nodeRegistry.ts)
- [ ] Node Data & Props Established in [`nodeTypes.ts`](frontend/src/nodeTypes.ts)

### Naming Convention
#### NODE COMPONENTS
`{nodeType}Node.json`

### Node Categories
| Category Name |
| ------------- |
| VISION        |
| DATA          |
| GENERAL       |


## BACKEND
- [ ] Node Manifest created in [`manifests dir`](backend/app/manifests)
- [ ] NodeClass registered in Backend [`classes.py`](backend/app/classes.py)
- [ ] Backend Function created in [`plugins dir`](backend/plugins)

### Naming Convention
#### PLUGINS
`{CATEGORY}_{nodeType}.py`

#### MANIFESTS
`{nodeType}Node.json`
