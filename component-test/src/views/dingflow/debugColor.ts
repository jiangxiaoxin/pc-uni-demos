/**
 * 根据节点 id 生成稳定的深色调试色。
 * 这里不使用真正的随机数，避免组件重新渲染后包围盒颜色跳变。
 */
export function getDebugBoxColor(id: string) {
  let hash = 0

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  }

  const hue = hash % 360
  const saturation = 58 + (hash % 18)
  const lightness = 24 + (hash % 10)

  return `hsl(${hue} ${saturation}% ${lightness}%)`
}
