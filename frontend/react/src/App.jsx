import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import axios from "axios";
import '@xyflow/react/dist/style.css';

const initialNodes = [];
const initialEdges = [];

const colorPalette = ['#A3D5FF', '#FFD5A3', '#D5FFA3', '#FFA3D5', '#A3FFD5', '#D5A3FF'];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Don't submit if text is empty
    if (!text.trim()) {
      setError('Please enter some text');
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios({
        method: "post",
        url: "http://localhost:8000/generate-summary",
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          longText: text, 
        },
      });

      const summaryStrings = response.data.summary.split("\n").filter(Boolean); 
      addSummaryToFlow(summaryStrings);
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.error || 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const addSummaryToFlow = (summaryStrings) => {
    const newNodes = summaryStrings.map((text, index) => {
      const id = `summary-${index}`;
      return {
        id,
        position: { x: 200 , y: 200 + index*100 }, 
        data: { label: text },
        style: {
          backgroundColor: colorPalette[index % colorPalette.length],
          color: '#000',
          border: '1px solid #007BFF',
          borderRadius: '8px',
          padding: '10px',
        },
      };
    });

    const newEdges = newNodes.slice(1).map((node, index) => ({
      id: `e-summary-${index}`,
      source: newNodes[index].id,
      target: node.id,
    }));

    setNodes((nds) => nds.concat(newNodes));
    setEdges((eds) => eds.concat(newEdges));
  };

  return (
    <div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px'}}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px' }}>
          <div>
            <textarea
              value={text}
              onChange={handleChange}
              placeholder="Enter your text here..."
              rows="5"
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ padding: '10px 20px', fontSize: '16px' }}
            >
              {isLoading ? 'Generating...' : 'Submit'}
            </button>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        </form>
      </div>
      <div style={{marginLeft:'4vw', width: '80vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
