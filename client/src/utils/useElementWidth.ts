import { useCallback, useEffect, useState } from 'react'

/**
 * Tracks the content width of a DOM element via ResizeObserver, so layout logic (e.g. how many
 * columns fit) can react to the actual available width instead of only viewport breakpoints.
 * Returns a ref callback to attach to the element and the last measured width in pixels (0 until
 * measured).
 *
 * A callback ref (rather than useRef + an empty-dependency effect) is used so measurement also
 * re-runs when the element mounts *after* this hook itself already mounted - e.g. when the table
 * it's attached to only renders once its data has finished loading.
 */
export function useElementWidth<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null)
  const [width, setWidth] = useState(0)

  const ref = useCallback((element: T | null) => {
    setNode(element)
  }, [])

  useEffect(() => {
    if (!node) return

    setWidth(node.clientWidth)

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setWidth(entry.contentRect.width)
      }
    })
    observer.observe(node)

    return () => observer.disconnect()
  }, [node])

  return [ref, width] as const
}
