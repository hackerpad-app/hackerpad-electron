import { TaskItem as TiptapTaskItem } from "@tiptap/extension-task-item";
import { mergeAttributes } from "@tiptap/core";

// Create a custom TaskItem extension
const CustomTaskItem = TiptapTaskItem.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      checked: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-checked") === "true",
        renderHTML: (attributes) => ({
          "data-checked": attributes.checked ? "true" : "false",
        }),
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const { checked } = node.attrs;
    const content = ["span", 0]; // Placeholder for the task item content

    return [
      "li",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": this.name,
      }),
      [
        "label",
        { "data-type": "taskItemLabel" },
        checked ? ["strike", {}, content] : content,
      ],
    ];
  },
});

export default CustomTaskItem;
