import {
  createTreeCollection,
  type NodeProviderProps,
  type TreeNodeType,
  TreeView,
  TreeViewBranch,
  TreeViewBranchContent,
  TreeViewBranchItem,
  TreeViewContent,
  TreeViewItem,
  TreeViewLabel,
  TreeViewNode,
  TreeViewTree,
} from "@/registry/react/components/tree-view";

const collection = createTreeCollection<TreeNodeType>({
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "src",
        name: "src",
        children: [
          {
            id: "src/components",
            name: "components",
            children: [
              { id: "src/components/button.tsx", name: "button.tsx" },
              { id: "src/components/tabs.tsx", name: "tabs.tsx" },
            ],
          },
          { id: "src/main.tsx", name: "main.tsx" },
          { id: "src/styles.css", name: "styles.css" },
        ],
      },
      { id: "package.json", name: "package.json" },
      { id: "README.md", name: "README.md" },
    ],
  },
});

const TreeNode = (props: NodeProviderProps<TreeNodeType>) => {
  const { node, indexPath } = props;

  return (
    <TreeViewNode indexPath={indexPath} node={node}>
      {node.children ? (
        <TreeViewBranch>
          <TreeViewBranchItem>{node.name}</TreeViewBranchItem>
          <TreeViewBranchContent>
            {node.children.map((child, index) => (
              <TreeNode
                indexPath={[...indexPath, index]}
                key={child.id}
                node={child}
              />
            ))}
          </TreeViewBranchContent>
        </TreeViewBranch>
      ) : (
        <TreeViewContent>
          <TreeViewItem>{node.name}</TreeViewItem>
        </TreeViewContent>
      )}
    </TreeViewNode>
  );
};

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <TreeView
        className="rounded-lg border border-white/10 p-2"
        collection={collection}
        defaultExpandedValue={["src", "src/components"]}
        defaultSelectedValue={["src/components/tabs.tsx"]}
      >
        <TreeViewLabel className="px-2 pt-1">Project files</TreeViewLabel>
        <TreeViewTree>
          {collection.rootNode.children?.map((node, index) => (
            <TreeNode indexPath={[index]} key={node.id} node={node} />
          ))}
        </TreeViewTree>
      </TreeView>
    </div>
  );
}
