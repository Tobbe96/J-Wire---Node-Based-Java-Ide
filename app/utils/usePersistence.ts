import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";

export function usePersistence (
    setNodes: (nodes: any) => void,
    setEdges: (edges: any) => void,
    addLog: (message: string) => void
) {
    const { toObject } = useReactFlow();
    const STORAGE_KEY = 'java-nodegraph-save';

    const saveNodeGraph = useCallback(() => {
        const flow = toObject();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
        addLog("> Nodegraph saved to LocalStorage");
    }, [toObject, addLog]);

    const loadNodeGraph = useCallback(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const flow = JSON.parse(savedData);
                if (flow) {
                    setNodes(flow.nodes || []);
                    setEdges(flow.edges || []);
                    addLog('> Nodegraph loaded successfully');
                }
            } catch (e) {
                console.error("Failed to load graph:", e);
            }
        }
    }, [setNodes, setEdges, addLog]);

    return { saveNodeGraph, loadNodeGraph };
}