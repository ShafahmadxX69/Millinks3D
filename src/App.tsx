import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text, Edges, TransformControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Plus as LucidePlus, 
  Trash2 as LucideTrash2, 
  RotateCw as LucideRotateCw, 
  Truck as LucideTruck, 
  AlertTriangle as LucideAlertTriangle, 
  CheckCircle as LucideCheckCircle, 
  Palette as LucidePalette, 
  ChevronUp as LucideChevronUp, 
  ChevronDown as LucideChevronDown, 
  Maximize as LucideMaximize, 
  Settings2 as LucideSettings2, 
  ShieldCheck as LucideShieldCheck, 
  Compass as LucideCompass, 
  Layers as LucideLayers,
  Hand as LucideHand,
  MousePointer2 as LucidePointer,
  Save as LucideSave,
  Grid3X3 as LucideNet,
  Undo as LucideUndo,
  Redo as LucideRedo,
  Copy as LucideCopy,
  Clipboard as LucideClipboard,
  RefreshCw as LucideRefreshCw,
  LogOut as LucideLogOut,
  Database as LucideDatabase,
  ExternalLink as LucideExternalLink,
  Sparkles as LucideSparkles,
  Download as LucideDownload
} from 'lucide-react';

import { 
  initAuth, 
  googleSignIn, 
  logoutUser, 
  fetchModelsFromSheet, 
  saveModelsToSheet,
  SPREADSHEET_ID,
  SHEET_NAME,
  type SheetModel 
} from './sheets';

// --- Constants & Library ---

const CONTAINER_TYPES = {
  '20GP': { label: '20FT (GP)', width: 5898, height: 2393, depth: 2352 },
  '40GP': { label: '40FT (GP)', width: 12032, height: 2393, depth: 2352 },
  '40HQ': { label: '40HQ (HQ)', width: 12032, height: 2698, depth: 2352 },
  '40TR': { label: 'TRIALO(HQ)', width: 12030, height: 2690, depth: 2350 }
};

const MODEL_LIBRARY = [
  { model: "FQ803", size: "20", length: 385, width: 255, height: 576 },
  { model: "FQ803", size: "21", length: 440, width: 255, height: 570 },
  { model: "FQ803", size: "29", length: 537, width: 300, height: 789 },
  { model: "FQ803", size: "24", length: 461, width: 295, height: 686 },
  { model: "FL688", size: "16", length: 375, width: 245, height: 422 },
  { model: "FL688", size: "17", length: 435, width: 245, height: 422 },
  { model: "FL688", size: "21", length: 421, width: 255, height: 566 },
  { model: "FL688", size: "24", length: 461, width: 295, height: 686 },
  { model: "FL688", size: "19", length: 424, width: 242, height: 577 },
  { model: "FL688", size: "29", length: 537, width: 300, height: 789 },
  { model: "FL688", size: "20", length: 385, width: 255, height: 576 },
  { model: "FL688", size: "31", length: 411, width: 350, height: 811 },
  { model: "FL688", size: "32", length: 581, width: 345, height: 883 },
  { model: "FL688", size: "29.5", length: 420, width: 385, height: 807 },
  { model: "FJ616", size: "16", length: 424, width: 228, height: 440 },
  { model: "FJ616", size: "20", length: 382, width: 262, height: 582 },
  { model: "FJ616", size: "24", length: 467, width: 285, height: 692 },
  { model: "FJ616", size: "19.5", length: 415, width: 235, height: 600 },
  { model: "FJ616", size: "29", length: 522, width: 292, height: 792 },
  { model: "FJ616", size: "31", length: 400, width: 340, height: 830 },
  { model: "FJ616", size: "32", length: 558, width: 325, height: 880 },
  { model: "FQ819-1", size: "21", length: 634, width: 419, height: 258 },
  { model: "FQ819-1", size: "26", length: 757, width: 469, height: 293 },
  { model: "FQ819-1", size: "29", length: 845, width: 519, height: 333 },
  { model: "FR873", size: "21", length: 255, width: 365, height: 580 },
  { model: "FR873", size: "22", length: 280, width: 390, height: 600 },
  { model: "FR873", size: "25", length: 315, width: 485, height: 680 },
  { model: "FR873", size: "29", length: 350, width: 535, height: 750 },
  { model: "FL678", size: "19.5", length: 410, width: 207, height: 548 },
  { model: "FL678", size: "20", length: 240, width: 370, height: 568 },
  { model: "FL678", size: "21", length: 355, width: 240, height: 575 },
  { model: "FL678", size: "25", length: 459, width: 283, height: 685 },
  { model: "FL678", size: "28", length: 504, width: 315, height: 750 },
  { model: "FQ822", size: "19.5", length: 210, width: 412, height: 569 },
  { model: "FQ822", size: "20", length: 240, width: 370, height: 568 },
  { model: "FQ822", size: "21", length: 248, width: 407, height: 600 },
  { model: "FQ822", size: "25", length: 288, width: 480, height: 703 },
  { model: "FQ822", size: "28", length: 320, width: 520, height: 775 },
  { model: "FQ822", size: "31", length: 340, width: 600, height: 860 },
  { model: "F1627-5", size: "S Lite 19", length: 535, width: 360, height: 220 },
  { model: "F1627-5", size: "Fit Lite 28", length: 690, width: 440, height: 350 },
  { model: "F1627-5", size: "Fit L 29.5", length: 765, width: 450, height: 350 },
  { model: "F1627-5", size: "S 21", length: 551, width: 279, height: 386 },
  { model: "F1627-5", size: "M 26", length: 650, width: 315, height: 470 },
  { model: "F1627-5", size: "L 30", length: 790, width: 351, height: 569 },
  { model: "F1627-5-01", size: "S 21", length: 551, width: 279, height: 386 },
  { model: "F1627-5-01", size: "M 26", length: 650, width: 315, height: 470 },
  { model: "F1627-5-01", size: "L 30", length: 790, width: 351, height: 569 },
  { model: "F1628-5-01", size: "Fit L 29.5", length: 780, width: 371, height: 480 },
  { model: "F1627-5-01", size: "S Lite 21", length: 551, width: 236, height: 386 },
  { model: "F1628-5-01", size: "Fit Lite 28", length: 701, width: 371, height: 465 },
  { model: "PP12-3", size: "S#", length: 561, width: 391, height: 244 },
  { model: "PP12-3", size: "M#", length: 681, width: 475, height: 282 },
  { model: "PP12-3", size: "L#", length: 790, width: 551, height: 330 },
  { model: "PP12-3", size: "SML#", length: 790, width: 551, height: 330 },
  { model: "FQ825", size: "21", length: 589, width: 378, height: 240 },
  { model: "FQ825", size: "22", length: 616, width: 406, height: 257 },
  { model: "FQ825", size: "26", length: 694, width: 482, height: 282 },
  { model: "FQ825", size: "29", length: 768, width: 527, height: 322 },
  { model: "FQ832", size: "21", length: 589, width: 378, height: 240 },
  { model: "FQ832", size: "22", length: 616, width: 406, height: 257 },
  { model: "FQ832", size: "26", length: 694, width: 482, height: 282 },
  { model: "FQ832", size: "29", length: 768, width: 527, height: 322 },
  { model: "F4625", size: "21", length: 589, width: 378, height: 255 },
  { model: "F4625", size: "22", length: 616, width: 406, height: 257 },
  { model: "F4625", size: "27", length: 750, width: 435, height: 355 },
  { model: "F1425", size: "20", length: 615, width: 405, height: 230 },
  { model: "F1425", size: "26", length: 710, width: 492, height: 280 },
  { model: "F1425", size: "31", length: 820, width: 515, height: 315 },
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

// --- Types ---

interface CargoItem {
  id: string;
  model: string;
  size: string;
  qty: number;
  color: string;
}

interface ContainerInstance {
  id: string;
  type: keyof typeof CONTAINER_TYPES;
  items: CargoItem[];
  hasNet?: boolean;
}

interface PackedBox {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  modelInfo: string;
  itemId: string;
}

interface PackingResult {
  containerId: string;
  containerType: keyof typeof CONTAINER_TYPES;
  packedBoxes: PackedBox[];
  unfitItems: { model: string; size: string; count: number }[];
  packedVolume: number;
  totalVolume: number;
  hasNet?: boolean;
}

interface HistoryState {
  containers: ContainerInstance[];
  results: PackingResult[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Strategic No-Gap Packing Logic ---

function packBoxesOptimized(
  containers: ContainerInstance[],
  modelLibrary: typeof MODEL_LIBRARY = MODEL_LIBRARY,
  boxSurfaceDirection: 'default' | 'alternate' | 'height-max' | 'height-min' = 'default'
): PackingResult[] {
  const results: PackingResult[] = [];

  containers.forEach(containerInst => {
    const cType = CONTAINER_TYPES[containerInst.type];
    const packedBoxes: PackedBox[] = [];
    
    let loadingTasks = containerInst.items.map(item => {
      const match = modelLibrary.find(m => m.model === item.model && m.size === item.size);
      const dims = match ? { l: match.length, w: match.width, h: match.height } : { l: 200, w: 200, h: 200 };
      return { ...dims, item };
    });

    loadingTasks.sort((a, b) => (b.l * b.w * b.h) - (a.l * a.w * a.h));

    let points = [{ x: 0, y: 0, z: 0 }];
    const unfitTracker: Record<string, number> = {};

    loadingTasks.forEach(task => {
      let qtyRemaining = task.item.qty;

      const allRotations = [
        [task.l, task.w, task.h],
        [task.l, task.h, task.w],
        [task.w, task.l, task.h],
        [task.w, task.h, task.l],
        [task.h, task.l, task.w],
        [task.h, task.w, task.l],
      ];

      while (qtyRemaining > 0) {
        let bestPlacement: { pIndex: number, rotation: number[], x: number, y: number, z: number } | null = null;
        
        // Strict Priority: 
        // 1. Back Wall to Door (X)
        // 2. Bottom to Top (Y)
        // 3. Left to Right (Z)
        points.sort((a, b) => 
          (a.x - b.x) || 
          (a.y - b.y) || 
          (a.z - b.z)
        );

        // Sort rotations to prefer "wall-hugging" or alternate face based on preference
        const sortedRotations = [...allRotations].sort((a, b) => {
          if (boxSurfaceDirection === 'alternate') {
            return b[0] - a[0]; // Prefers larger width along container X-axis (length-wise)
          } else if (boxSurfaceDirection === 'height-max') {
            return b[1] - a[1]; // Prefers larger height along container Y-axis (Upright/fragile)
          } else if (boxSurfaceDirection === 'height-min') {
            return a[1] - b[1]; // Prefers smaller height along container Y-axis (Flat/stable)
          } else {
            return a[0] - b[0]; // Default: Prefers smaller width along container X-axis (wall-hugging)
          }
        });

        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          for (const rotation of sortedRotations) {
            const [rw, rh, rd] = rotation;
            if (p.x + rw > cType.width || p.y + rh > cType.height || p.z + rd > cType.depth) continue;

            const hasCollision = packedBoxes.some(pb => (
              p.x < pb.x + pb.width - 0.5 && p.x + rw > pb.x + 0.5 &&
              p.y < pb.y + pb.height - 0.5 && p.y + rh > pb.y + 0.5 &&
              p.z < pb.z + pb.depth - 0.5 && p.z + rd > pb.z + 0.5
            ));
            if (hasCollision) continue;

            // Physical support check (80% area)
            if (p.y > 0) {
              let supportArea = 0;
              for (const pb of packedBoxes) {
                if (Math.abs(pb.y + pb.height - p.y) < 1.0) {
                  const ix = Math.max(0, Math.min(p.x + rw, pb.x + pb.width) - Math.max(p.x, pb.x));
                  const iz = Math.max(0, Math.min(p.z + rd, pb.z + pb.depth) - Math.max(p.z, pb.z));
                  supportArea += ix * iz;
                }
              }
              if (supportArea < rw * rd * 0.8) continue;
            }

            // First fit found based on strict point priority
            bestPlacement = { pIndex: i, rotation, x: p.x, y: p.y, z: p.z };
            break;
          }
          if (bestPlacement) break;
        }

        if (bestPlacement) {
          const [rw, rh, rd] = bestPlacement.rotation;
          packedBoxes.push({
            id: generateId(),
            x: bestPlacement.x, y: bestPlacement.y, z: bestPlacement.z,
            width: rw, height: rh, depth: rd,
            color: task.item.color,
            modelInfo: `${task.item.model} (${task.item.size}")`,
            itemId: task.item.id
          });
          points.push({ x: bestPlacement.x + rw, y: bestPlacement.y, z: bestPlacement.z });
          points.push({ x: bestPlacement.x, y: bestPlacement.y + rh, z: bestPlacement.z });
          points.push({ x: bestPlacement.x, y: bestPlacement.y, z: bestPlacement.z + rd });
          points.splice(bestPlacement.pIndex, 1);
          points = points.filter((pt, idx, self) => {
            const submerged = packedBoxes.some(pb => 
              pt.x >= pb.x && pt.x < pb.x + pb.width - 0.5 &&
              pt.y >= pb.y && pt.y < pb.y + pb.height - 0.5 &&
              pt.z >= pb.z && pt.z < pb.z + pb.depth - 0.5
            );
            if (submerged) return false;
            return !self.slice(0, idx).some(other => Math.abs(other.x - pt.x) < 0.5 && Math.abs(other.y - pt.y) < 0.5 && Math.abs(other.z - pt.z) < 0.5);
          });
          qtyRemaining--;
        } else {
          const key = `${task.item.model}-${task.item.size}`;
          unfitTracker[key] = (unfitTracker[key] || 0) + qtyRemaining;
          break;
        }
      }
    });

    results.push({
      containerId: containerInst.id,
      containerType: containerInst.type,
      packedBoxes,
      unfitItems: Object.entries(unfitTracker).map(([k, v]) => ({ model: k.split('-')[0], size: k.split('-')[1], count: v })),
      packedVolume: packedBoxes.reduce((acc, b) => acc + b.width * b.height * b.depth, 0),
      totalVolume: cType.width * cType.height * cType.depth,
      hasNet: containerInst.hasNet
    });
  });

  return results;
}

// --- Physics & Collision Utils ---

function checkCollision(box: PackedBox, allBoxes: PackedBox[], containerType: keyof typeof CONTAINER_TYPES, netX?: number): boolean {
  const cType = CONTAINER_TYPES[containerType];
  
  // Container Walls
  if (box.x < 0 || box.y < 0 || box.z < 0) return true;
  if (box.x + box.width > cType.width || box.y + box.height > cType.height || box.z + box.depth > cType.depth) return true;
  
  // Net Boundary
  if (netX !== undefined && box.x + box.width > netX) return true;

  // Other Boxes
  return allBoxes.some(other => {
    if (other.id === box.id) return false;
    return (
      box.x < other.x + other.width - 1 &&
      box.x + box.width > other.x + 1 &&
      box.y < other.y + other.height - 1 &&
      box.y + box.height > other.y + 1 &&
      box.z < other.z + other.depth - 1 &&
      box.z + box.depth > other.z + 1
    );
  });
}

function applyGravity(box: PackedBox, allBoxes: PackedBox[], containerType: keyof typeof CONTAINER_TYPES, netX?: number): PackedBox {
  let current = { ...box };
  let settled = false;
  
  while (!settled) {
    let next = { ...current, y: current.y - 10 }; // Step down 10mm
    if (next.y < 0 || checkCollision(next, allBoxes, containerType, netX)) {
      settled = true;
    } else {
      current = next;
    }
  }
  
  // Also settle towards back (X-axis) for tighter stuffing
  settled = false;
  while (!settled) {
    let next = { ...current, x: current.x - 10 };
    if (next.x < 0 || checkCollision(next, allBoxes, containerType, netX)) {
      settled = true;
    } else {
      current = next;
    }
  }

  return current;
}

function checkGroupCollision(
  selectedBoxIds: string[],
  delta: { x: number; y: number; z: number },
  allBoxes: PackedBox[],
  containerType: keyof typeof CONTAINER_TYPES,
  netX?: number
): boolean {
  const cType = CONTAINER_TYPES[containerType];
  const nonSelected = allBoxes.filter(b => !selectedBoxIds.includes(b.id));

  for (const id of selectedBoxIds) {
    const box = allBoxes.find(b => b.id === id);
    if (!box) continue;

    const testBox = {
      ...box,
      x: box.x + delta.x,
      y: box.y + delta.y,
      z: box.z + delta.z
    };

    // Container Walls
    if (testBox.x < 0 || testBox.y < 0 || testBox.z < 0) return true;
    if (testBox.x + testBox.width > cType.width || testBox.y + testBox.height > cType.height || testBox.z + testBox.depth > cType.depth) return true;

    // Net
    if (netX !== undefined && testBox.x + testBox.width > netX) return true;

    // Collision with non-selected
    const collides = nonSelected.some(other => {
      return (
        testBox.x < other.x + other.width - 1 &&
        testBox.x + testBox.width > other.x + 1 &&
        testBox.y < other.y + other.height - 1 &&
        testBox.y + testBox.height > other.y + 1 &&
        testBox.z < other.z + other.depth - 1 &&
        testBox.z + testBox.depth > other.z + 1
      );
    });

    if (collides) return true;
  }

  return false;
}

function applyGroupGravity(
  selectedBoxIds: string[],
  allBoxes: PackedBox[],
  containerType: keyof typeof CONTAINER_TYPES,
  netX?: number
): { x: number; y: number; z: number } {
  let delta = { x: 0, y: 0, z: 0 };
  let settled = false;

  // Settle down (Y)
  while (!settled) {
    const nextDelta = { ...delta, y: delta.y - 10 };
    if (checkGroupCollision(selectedBoxIds, nextDelta, allBoxes, containerType, netX)) {
      settled = true;
    } else {
      delta = nextDelta;
    }
  }

  // Settle back (X-axis)
  settled = false;
  while (!settled) {
    const nextDelta = { ...delta, x: delta.x - 10 };
    if (checkGroupCollision(selectedBoxIds, nextDelta, allBoxes, containerType, netX)) {
      settled = true;
    } else {
      delta = nextDelta;
    }
  }

  return delta;
}

function findBestRotation(centerX: number, centerY: number, centerZ: number, originalBox: PackedBox, allBoxes: PackedBox[], containerType: keyof typeof CONTAINER_TYPES, netX?: number): PackedBox | null {
  const dims = [originalBox.width, originalBox.height, originalBox.depth];
  
  // All 6 unique permutations of dimensions
  const perms: [number, number, number][] = [];
  const rawPerms = [
    [dims[0], dims[1], dims[2]], [dims[0], dims[2], dims[1]],
    [dims[1], dims[0], dims[2]], [dims[1], dims[2], dims[0]],
    [dims[2], dims[0], dims[1]], [dims[2], dims[1], dims[0]]
  ];
  const seen = new Set<string>();
  for(const p of rawPerms) {
    const s = p.join(',');
    if(!seen.has(s)) {
      perms.push(p as [number, number, number]);
      seen.add(s);
    }
  }

  let best: PackedBox | null = null;
  let minScore = Infinity;

  for (const [rw, rh, rd] of perms) {
    const testBox = {
      ...originalBox,
      width: rw,
      height: rh,
      depth: rd,
      x: centerX - rw / 2,
      y: centerY - rh / 2,
      z: centerZ - rd / 2
    };

    if (!checkCollision(testBox, allBoxes, containerType, netX)) {
      // Score: prioritize lower Y, then lower X (back wall), then original rotation if possible
      const score = testBox.y * 10 + testBox.x; 
      if (score < minScore) {
        minScore = score;
        best = testBox;
      }
    }
  }
  return best;
}

// --- Components ---

interface Box3DProps {
  box: PackedBox;
  isSelected: boolean;
  selectedBoxIds?: string[];
  onSelect: (id: string, selectMultiple?: boolean) => void;
  isManualMode: boolean;
  transformMode: 'translate' | 'rotate';
  onUpdate: (id: string, updates: Partial<PackedBox>) => void;
  allBoxes: PackedBox[];
  containerType: keyof typeof CONTAINER_TYPES;
  netX?: number;
  autoSettle?: boolean;
  renderOptions?: { showCabin: boolean; showNet: boolean; showTruck: boolean; showLabels?: boolean };
}

const Box3D: React.FC<Box3DProps> = ({ box, isSelected, selectedBoxIds = [], onSelect, isManualMode, transformMode, onUpdate, allBoxes, containerType, netX, autoSettle = true, renderOptions }) => {
  const s = 0.001; 
  const meshRef = useRef<THREE.Mesh>(null);
  const lastValidPos = useRef({ x: box.x, y: box.y, z: box.z, width: box.width, height: box.height, depth: box.depth });
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    lastValidPos.current = { x: box.x, y: box.y, z: box.z, width: box.width, height: box.height, depth: box.depth };
    setIsValid(true);
  }, [box.x, box.y, box.z, box.width, box.height, box.depth]);

  const isPrimaryAnchor = selectedBoxIds[0] === box.id;

  return (
    <group>
      <mesh 
        ref={meshRef}
        position={[(box.x + box.width / 2) * s, (box.y + box.height / 2) * s, (box.z + box.depth / 2) * s]} 
        castShadow 
        receiveShadow
        onClick={(e) => {
          if (isManualMode) {
            e.stopPropagation();
            onSelect(box.id, e.shiftKey || e.ctrlKey || e.metaKey);
          }
        }}
      >
        <boxGeometry args={[box.width * s, box.height * s, box.depth * s]} />
        <meshStandardMaterial 
          color={isValid ? box.color : "#ef4444"} 
          roughness={0.3} 
          metalness={0.05} 
          emissive={isSelected ? (isValid ? "#ffffff" : "#ff0000") : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : 0}
          transparent={!isValid}
          opacity={isValid ? 1 : 0.7}
        />
        <Edges color={isSelected ? (isValid ? "#3b82f6" : "#ef4444") : "#000"} threshold={15} opacity={isSelected ? 1 : 0.6} transparent />
      </mesh>

      {renderOptions?.showLabels && (
        <Html
          position={[
            (box.x + box.width / 2) * s,
            (box.y + box.height + 15) * s,
            (box.z + box.depth / 2) * s
          ]}
          center
          distanceFactor={6}
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '8px',
            fontWeight: 800,
            background: isSelected ? 'rgba(37, 99, 235, 0.95)' : 'rgba(15, 23, 42, 0.85)',
            color: '#fff',
            padding: '2px 5px',
            borderRadius: '4px',
            border: isSelected ? '1px solid #fff' : '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            userSelect: 'none',
            transition: 'all 0.1s'
          }}
        >
          {box.modelInfo} — {box.width}×{box.height}×{box.depth} mm
        </Html>
      )}

      {isSelected && isManualMode && isPrimaryAnchor && (
        <TransformControls 
          object={meshRef.current || undefined} 
          mode={transformMode}
          onObjectChange={() => {
            if (meshRef.current) {
              const pos = meshRef.current.position;
              const cType = CONTAINER_TYPES[containerType];
              
              // Clamp to container boundaries to prevent passing through walls
              const minX = (box.width / 2) * s;
              const maxX = (cType.width - box.width / 2) * s;
              const minY = (box.height / 2) * s;
              const maxY = (cType.height - box.height / 2) * s;
              const minZ = (box.depth / 2) * s;
              const maxZ = (cType.depth - box.depth / 2) * s;

              pos.x = Math.max(minX, Math.min(maxX, pos.x));
              pos.y = Math.max(minY, Math.min(maxY, pos.y));
              pos.z = Math.max(minZ, Math.min(maxZ, pos.z));

              const centerX = pos.x / s;
              const centerY = pos.y / s;
              const centerZ = pos.z / s;
              
              if (transformMode === 'translate') {
                const isMulti = selectedBoxIds && selectedBoxIds.includes(box.id) && selectedBoxIds.length > 1;
                if (isMulti) {
                  const dragDeltaX = centerX - (box.x + box.width / 2);
                  const dragDeltaY = centerY - (box.y + box.height / 2);
                  const dragDeltaZ = centerZ - (box.z + box.depth / 2);
                  const collides = checkGroupCollision(selectedBoxIds, { x: dragDeltaX, y: dragDeltaY, z: dragDeltaZ }, allBoxes, containerType, netX);
                  setIsValid(!collides);
                } else {
                  if (autoSettle) {
                    const bestFit = findBestRotation(centerX, centerY, centerZ, box, allBoxes, containerType, netX);
                    if (bestFit) {
                      meshRef.current.scale.set(
                        bestFit.width / box.width,
                        bestFit.height / box.height,
                        bestFit.depth / box.depth
                      );
                      if (!isValid) setIsValid(true);
                    } else {
                      if (isValid) setIsValid(false);
                    }
                  } else {
                    const testBox = {
                      ...box,
                      x: centerX - box.width / 2,
                      y: centerY - box.height / 2,
                      z: centerZ - box.depth / 2
                    };
                    const collides = checkCollision(testBox, allBoxes, containerType, netX);
                    setIsValid(!collides);
                    meshRef.current.scale.set(1, 1, 1);
                  }
                }
              } else {
                // In rotate mode, we check collision with current rotation
                const currentBox = {
                  ...box,
                  x: centerX - box.width / 2,
                  y: centerY - box.height / 2,
                  z: centerZ - box.depth / 2
                };
                setIsValid(!checkCollision(currentBox, allBoxes, containerType, netX));
              }
            }
          }}
          onMouseUp={() => {
            if (meshRef.current) {
              const pos = meshRef.current.position;
              const centerX = pos.x / s;
              const centerY = pos.y / s;
              const centerZ = pos.z / s;

              const isMulti = selectedBoxIds && selectedBoxIds.includes(box.id) && selectedBoxIds.length > 1;

              if (transformMode === 'translate') {
                if (isMulti) {
                  const dragDeltaX = centerX - (box.x + box.width / 2);
                  const dragDeltaY = centerY - (box.y + box.height / 2);
                  const dragDeltaZ = centerZ - (box.z + box.depth / 2);

                  const baseDelta = { x: dragDeltaX, y: dragDeltaY, z: dragDeltaZ };
                  const gravityDelta = autoSettle 
                    ? applyGroupGravity(selectedBoxIds, allBoxes, containerType, netX)
                    : { x: 0, y: 0, z: 0 };
                  onUpdate(box.id, {
                    x: box.x + baseDelta.x + gravityDelta.x,
                    y: box.y + baseDelta.y + gravityDelta.y,
                    z: box.z + baseDelta.z + gravityDelta.z
                  });
                  if (meshRef.current) meshRef.current.scale.set(1, 1, 1);
                  setIsValid(true);
                } else {
                  if (autoSettle) {
                    const bestFit = findBestRotation(centerX, centerY, centerZ, box, allBoxes, containerType, netX);
                    if (!bestFit) {
                      onUpdate(box.id, {
                        x: centerX - box.width / 2,
                        y: centerY - box.height / 2,
                        z: centerZ - box.depth / 2
                      });
                      if (meshRef.current) meshRef.current.scale.set(1, 1, 1);
                      setIsValid(true);
                    } else {
                      const settledBox = applyGravity(bestFit, allBoxes, containerType, netX);
                      onUpdate(box.id, { 
                        x: settledBox.x, 
                        y: settledBox.y, 
                        z: settledBox.z,
                        width: settledBox.width,
                        height: settledBox.height,
                        depth: settledBox.depth
                      });
                      if (meshRef.current) meshRef.current.scale.set(1, 1, 1);
                      setIsValid(true);
                    }
                  } else {
                    onUpdate(box.id, {
                      x: centerX - box.width / 2,
                      y: centerY - box.height / 2,
                      z: centerZ - box.depth / 2
                    });
                    if (meshRef.current) meshRef.current.scale.set(1, 1, 1);
                    setIsValid(true);
                  }
                }
              } else {
                // Free Rotate snap to closest 90-degree axis permutation
                const localX = new THREE.Vector3(1, 0, 0).applyQuaternion(meshRef.current.quaternion);
                const localY = new THREE.Vector3(0, 1, 0).applyQuaternion(meshRef.current.quaternion);
                const localZ = new THREE.Vector3(0, 0, 1).applyQuaternion(meshRef.current.quaternion);
                
                const axes = [localX, localY, localZ];
                const dims = [box.width, box.height, box.depth];
                
                const mappings = [
                  [0, 1, 2], [0, 2, 1],
                  [1, 0, 2], [1, 2, 0],
                  [2, 0, 1], [2, 1, 0]
                ];
                
                let bestMapping = mappings[0];
                let maxScore = -1;
                for (const map of mappings) {
                  const score = Math.abs(axes[map[0]].x) + Math.abs(axes[map[1]].y) + Math.abs(axes[map[2]].z);
                  if (score > maxScore) {
                    maxScore = score;
                    bestMapping = map;
                  }
                }
                
                const nw = dims[bestMapping[0]];
                const nh = dims[bestMapping[1]];
                const nd = dims[bestMapping[2]];
                
                onUpdate(box.id, {
                  x: Math.max(0, centerX - nw / 2),
                  y: Math.max(0, centerY - nh / 2),
                  z: Math.max(0, centerZ - nd / 2),
                  width: nw,
                  height: nh,
                  depth: nd
                });
                meshRef.current.rotation.set(0, 0, 0);
                setIsValid(true);
              }
            }
          }}
        />
      )}
    </group>
  );
};

// --- 3D TRUCK & VEHICLE CABIN COMPONENTS ---

const Wheel3D: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Tire Outer */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.28, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Rim / Inner hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.3, 24]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Rim center cap */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.32, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
};

const DualWheel3D: React.FC<{ position: [number, number, number], spacing?: number }> = ({ position, spacing = 0.32 }) => {
  return (
    <group position={position}>
      <Wheel3D position={[0, 0, -spacing / 2]} />
      <Wheel3D position={[0, 0, spacing / 2]} />
    </group>
  );
};

const TractorHead3D: React.FC<{
  length: number;
  width: number;
  height: number;
  color: string;
}> = ({ length, width, height, color }) => {
  const cabL = 2.4;
  const cabW = width - 0.1;
  const cabH = height + 0.2;
  const bottomOffset = -0.1;

  return (
    <group position={[-1.75, 0, width / 2]}>
      {/* Main Cabin Body */}
      <mesh position={[0, cabH / 2 + bottomOffset, 0]} castShadow receiveShadow>
        <boxGeometry args={[cabL, cabH, cabW]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
        <Edges color="#1e3a8a" threshold={15} />
      </mesh>

      {/* Aerodynamic wind spoiler / Top Roof Cap */}
      <mesh position={[0.2, cabH + bottomOffset + 0.15, 0]} castShadow>
        <boxGeometry args={[1.6, 0.3, cabW - 0.1]} />
        <meshStandardMaterial color={color} roughness={0.3} />
        <Edges color="#1c3d5a" />
      </mesh>

      {/* Front windshield screen (slanted) */}
      <mesh position={[cabL / 2 - 0.1, cabH / 2 + 0.5, 0]} castShadow>
        <boxGeometry args={[0.3, 0.8, cabW - 0.15]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.1} metalness={0.9} transparent opacity={0.88} />
      </mesh>

      {/* Front Window and Side windows */}
      {/* Left side door glass */}
      <mesh position={[0.1, cabH / 2 + 0.5, cabW / 2 + 0.005]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.01]} />
        <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Right side door glass */}
      <mesh position={[0.1, cabH / 2 + 0.5, -cabW / 2 - 0.005]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.01]} />
        <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Front Grill / Bumper */}
      <mesh position={[cabL / 2 + 0.02, cabH / 4 + bottomOffset, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.8, cabW - 0.2]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Headlights (Warm Yellow/Orange) */}
      <mesh position={[cabL / 2 + 0.03, bottomOffset + 0.3, cabW / 2 - 0.25]} castShadow>
        <boxGeometry args={[0.04, 0.15, 0.2]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2.5} roughness={0.1} />
      </mesh>
      <mesh position={[cabL / 2 + 0.03, bottomOffset + 0.3, -cabW / 2 + 0.25]} castShadow>
        <boxGeometry args={[0.04, 0.15, 0.2]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2.5} roughness={0.1} />
      </mesh>

      {/* Rear exhaust chrome pipe stack */}
      <mesh position={[-cabL / 2 + 0.2, cabH / 2 + 0.4, -cabW / 2 + 0.2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.8, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.05} />
      </mesh>
    </group>
  );
};

const FullTruckChassis3D: React.FC<{
  containerType: keyof typeof CONTAINER_TYPES;
  showCabin: boolean;
  showTruck: boolean;
}> = ({ containerType, showCabin, showTruck }) => {
  if (!showTruck) return null;
  const cType = CONTAINER_TYPES[containerType];
  const s = 0.001;
  const length = cType.width * s;
  const height = cType.height * s;
  const width = cType.depth * s;

  return (
    <group>
      {/* 1. MAIN CHASSIS FRAME (Slate/dark steel beams under the container) */}
      <mesh position={[length / 2, -0.06, width / 2]} castShadow receiveShadow>
        <boxGeometry args={[length + 3.6, 0.12, width - 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Sideguards under the container (common on European/Asian trucks like the one in visual) */}
      <mesh position={[length / 2 - 1.0, -0.22, 0.08]} castShadow>
        <boxGeometry args={[length - 4.5, 0.2, 0.05]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh position={[length / 2 - 1.0, -0.22, width - 0.08]} castShadow>
        <boxGeometry args={[length - 4.5, 0.2, 0.05]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* 2. REAR WHEELS (3 AXLES under container back door) */}
      <DualWheel3D position={[length - 0.6, -0.42, 0.18]} />
      <DualWheel3D position={[length - 0.6, -0.42, width - 0.18]} />

      <DualWheel3D position={[length - 1.6, -0.42, 0.18]} />
      <DualWheel3D position={[length - 1.6, -0.42, width - 0.18]} />

      <DualWheel3D position={[length - 2.6, -0.42, 0.18]} />
      <DualWheel3D position={[length - 2.6, -0.42, width - 0.18]} />

      {/* 3. TRACTOR CABIN (Only shown if showCabin is true) */}
      {showCabin && (
        <>
          <TractorHead3D length={length} width={width} height={height} color="#2563eb" />
          
          {/* Tractor Wheels */}
          {/* Single Front Steering Wheels */}
          <Wheel3D position={[-2.8, -0.42, 0.18]} />
          <Wheel3D position={[-2.8, -0.42, width - 0.18]} />

          {/* Dual Rear Drive Wheels under Tractor */}
          <DualWheel3D position={[-1.3, -0.42, 0.18]} />
          <DualWheel3D position={[-1.3, -0.42, width - 0.18]} />
        </>
      )}
    </group>
  );
};

const Container3D: React.FC<{ 
  result: PackingResult; 
  offset: [number, number, number];
  selectedBoxIds: string[];
  onSelectBox: (id: string, selectMultiple?: boolean) => void;
  isManualMode: boolean;
  transformMode: 'translate' | 'rotate';
  onUpdateBox: (containerId: string, boxId: string, updates: Partial<PackedBox>) => void;
  renderOptions: { showCabin: boolean; showNet: boolean; showTruck: boolean; showLabels?: boolean };
  timelineStep: number | null;
  cumulativeStart: number;
  autoSettle: boolean;
}> = ({ result, offset, selectedBoxIds, onSelectBox, isManualMode, transformMode, onUpdateBox, renderOptions, timelineStep, cumulativeStart, autoSettle }) => {
  const cType = CONTAINER_TYPES[result.containerType];
  const s = 0.001;

  const netX = useMemo(() => {
    if (!result.hasNet || !renderOptions.showNet) return undefined;
    const maxX = result.packedBoxes.reduce((max, b) => Math.max(max, b.x + b.width), 0);
    return maxX + 50; // 50mm buffer
  }, [result.hasNet, renderOptions.showNet, result.packedBoxes]);

  return (
    <group position={offset}>
      <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
        {/* Render Truck Chassis & Cabin beneath/in-front of the container */}
        <FullTruckChassis3D 
          containerType={result.containerType} 
          showCabin={renderOptions.showCabin} 
          showTruck={renderOptions.showTruck} 
        />

        <mesh position={[(cType.width / 2) * s, (cType.height / 2) * s, (cType.depth / 2) * s]}>
          <boxGeometry args={[cType.width * s, cType.height * s, cType.depth * s]} />
          <meshBasicMaterial transparent opacity={0.05} color="#0f172a" side={THREE.BackSide} />
          <Edges color="#334155" threshold={15} opacity={0.4} transparent />
        </mesh>
        
        {result.hasNet && netX && (
          <mesh position={[netX * s, (cType.height / 2) * s, (cType.depth / 2) * s]}>
            <planeGeometry args={[0.01, cType.height * s, cType.depth * s]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.2} side={THREE.DoubleSide} wireframe />
            <Edges color="#ef4444" />
            <Text position={[0, (cType.height / 2) * s + 0.2, 0]} fontSize={0.2} color="#ef4444" fontWeight="bold">CARGO NET ACTIVE</Text>
          </mesh>
        )}

        {/* Orientation Labels */}
        <Text position={[-0.6, (cType.height / 2) * s, (cType.depth / 2) * s]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.3} color="#64748b" fontWeight="bold">1. FRONT WALL (INNERMOST)</Text>
        
        <group position={[cType.width * s, (cType.height / 2) * s, (cType.depth / 2) * s]}>
          <mesh><boxGeometry args={[0.01, cType.height * s, cType.depth * s]} /><meshBasicMaterial color="#3b82f6" transparent opacity={0.12} /></mesh>
          <Text rotation={[0, Math.PI / 2, 0]} position={[0.4, 0, 0]} fontSize={0.3} color="#3b82f6" fontWeight="bold">4. DOOR ACCESS (BACK)</Text>
        </group>

        <Text position={[(cType.width / 2) * s, (cType.height / 2) * s, (cType.depth) * s + 0.4]} rotation={[0, 0, 0]} fontSize={0.3} color="#64748b" fontWeight="bold">2. LEFT SIDE</Text>
        <Text position={[(cType.width / 2) * s, (cType.height / 2) * s, -0.4]} rotation={[0, Math.PI, 0]} fontSize={0.3} color="#64748b" fontWeight="bold">3. RIGHT SIDE</Text>

        {/* Dimension Labels */}
        <Text position={[(cType.width / 2) * s, -0.4, (cType.depth / 2) * s]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.25} color="#94a3b8">LENGTH: {(cType.width / 1000).toFixed(2)}m</Text>
        <Text position={[cType.width * s + 0.4, (cType.height / 2) * s, (cType.depth / 2) * s]} rotation={[0, Math.PI / 2, 0]} fontSize={0.25} color="#94a3b8">HEIGHT: {(cType.height / 1000).toFixed(2)}m</Text>
        <Text position={[-0.4, (cType.height / 2) * s - 0.5, (cType.depth / 2) * s]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.25} color="#94a3b8">WIDTH: {(cType.depth / 1000).toFixed(2)}m</Text>

        <Text position={[(cType.width / 2) * s, (cType.height + 600) * s, (cType.depth / 2) * s]} fontSize={0.45} color="#0f172a" fontWeight="bold">
          {CONTAINER_TYPES[result.containerType].label} — {result.packedBoxes.length} UNITS
        </Text>

        {result.packedBoxes.map((box, boxIdx) => {
          // Calculate global index for stuffing timeline sequence
          const globalBoxIdx = cumulativeStart + boxIdx;
          if (timelineStep !== null && globalBoxIdx >= timelineStep) {
            return null;
          }
          return (
            <Box3D 
              key={box.id} 
              box={box} 
              isSelected={selectedBoxIds.includes(box.id)}
              selectedBoxIds={selectedBoxIds}
              onSelect={onSelectBox}
              isManualMode={isManualMode}
              transformMode={transformMode}
              onUpdate={(id, updates) => onUpdateBox(result.containerId, id, updates)}
              allBoxes={result.packedBoxes}
              containerType={result.containerType}
              netX={netX}
              autoSettle={autoSettle}
              renderOptions={renderOptions}
            />
          );
        })}
      </group>
    </group>
  );
};

// --- App Hub ---

export default function App() {
  const [customModels, setCustomModels] = useState<{ model: string; size: string; length: number; width: number; height: number }[]>(() => {
    try {
      const saved = localStorage.getItem('customModels');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [modelLibrary, setModelLibrary] = useState<{ model: string; size: string; length: number; width: number; height: number }[]>(() => {
    try {
      const saved = localStorage.getItem('customModels');
      const custom = saved ? JSON.parse(saved) : [];
      return [...MODEL_LIBRARY, ...custom];
    } catch (e) {
      return MODEL_LIBRARY;
    }
  });

  const [showCustomModelSec, setShowCustomModelSec] = useState(false);
  
  const [newModel, setNewModel] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newLength, setNewLength] = useState<number>(300);
  const [newWidth, setNewWidth] = useState<number>(300);
  const [newHeight, setNewHeight] = useState<number>(300);

  // Sheets Auth and Integration states
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [sheetStatus, setSheetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [authError, setAuthError] = useState<string | null>(null);

  // Load models from Google Sheet
  const syncFromGoogleSheet = useCallback(async (accessToken: string) => {
    setIsSyncing(true);
    setSheetStatus('loading');
    setSyncError(null);
    try {
      const sheetModels = await fetchModelsFromSheet(accessToken);
      if (sheetModels.length > 0) {
        // Update library and custom list
        setModelLibrary(sheetModels);
        const customOnly = sheetModels.filter(sm => 
          !MODEL_LIBRARY.some(ml => ml.model === sm.model && ml.size === sm.size)
        );
        setCustomModels(customOnly);
        localStorage.setItem('customModels', JSON.stringify(customOnly));
        setSheetStatus('success');
      } else {
        // Sheet is empty, fill it with current models
        const savedCustom = localStorage.getItem('customModels');
        const custom = savedCustom ? JSON.parse(savedCustom) : [];
        const initialList = [...MODEL_LIBRARY, ...custom];
        await saveModelsToSheet(accessToken, initialList);
        setModelLibrary(initialList);
        setSheetStatus('success');
      }
    } catch (err: any) {
      console.error('Error syncing from Google Sheets:', err);
      setSyncError(err.message || 'Failed to sync with Google Sheet.');
      setSheetStatus('error');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Listen to Auth State
  useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsAuthLoading(false);
        syncFromGoogleSheet(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [syncFromGoogleSheet]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      setIsAuthLoading(true);
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        await syncFromGoogleSheet(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setAuthError(err.message || String(err));
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setToken(null);
      setAuthError(null);
      // Reset modelLibrary back to local defaults + local customModels
      const saved = localStorage.getItem('customModels');
      const custom = saved ? JSON.parse(saved) : [];
      setModelLibrary([...MODEL_LIBRARY, ...custom]);
      setSheetStatus('idle');
      setSyncError(null);
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  };

  const handleAddNewModel = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newModel.trim() || !newSize.trim()) {
      alert("Please enter both Model name and Size.");
      return;
    }
    if (newLength <= 0 || newWidth <= 0 || newHeight <= 0) {
      alert("Dimensions must be positive values.");
      return;
    }

    const cleanedModel = newModel.trim().toUpperCase();
    const cleanedSize = newSize.trim();

    // Check if duplicate exists
    const duplicate = modelLibrary.find(m => m.model === cleanedModel && m.size === cleanedSize);
    if (duplicate) {
      alert(`Model ${cleanedModel} with size ${cleanedSize} already exists!`);
      return;
    }

    const newItem = {
      model: cleanedModel,
      size: cleanedSize,
      length: Number(newLength),
      width: Number(newWidth),
      height: Number(newHeight)
    };

    const updatedLibrary = [...modelLibrary, newItem];
    setModelLibrary(updatedLibrary);
    
    setCustomModels(prev => {
      const updatedCustom = [...prev, newItem];
      localStorage.setItem('customModels', JSON.stringify(updatedCustom));
      return updatedCustom;
    });

    // If authenticated, write the updated library directly to the Google Sheet
    if (token) {
      setIsSyncing(true);
      saveModelsToSheet(token, updatedLibrary)
        .then(() => {
          setSheetStatus('success');
        })
        .catch((err: any) => {
          console.error('Failed to sync added model:', err);
          setSyncError('Added model locally, but Google Sheet update failed: ' + err.message);
          setSheetStatus('error');
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }

    setNewSize('');
    setNewLength(300);
    setNewWidth(300);
    setNewHeight(300);
  };

  const handleRemoveCustomModel = (model: string, size: string) => {
    const updatedLibrary = modelLibrary.filter(m => !(m.model === model && m.size === size));
    setModelLibrary(updatedLibrary);
    
    setCustomModels(prev => {
      const updatedCustom = prev.filter(m => !(m.model === model && m.size === size));
      localStorage.setItem('customModels', JSON.stringify(updatedCustom));
      return updatedCustom;
    });

    // If authenticated, write the updated library directly to the Google Sheet
    if (token) {
      setIsSyncing(true);
      saveModelsToSheet(token, updatedLibrary)
        .then(() => {
          setSheetStatus('success');
        })
        .catch((err: any) => {
          console.error('Failed to sync removed model:', err);
          setSyncError('Removed model locally, but Google Sheet update failed: ' + err.message);
          setSheetStatus('error');
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  };

  const [containers, setContainers] = useState<ContainerInstance[]>([{ id: generateId(), type: '20GP', items: [] }]);
  const [results, setResults] = useState<PackingResult[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPacking, setIsPacking] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate');
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
  const [autoSettle, setAutoSettle] = useState<boolean>(true);
  const selectedBoxId = selectedBoxIds[0] || null;
  const setSelectedBoxId = useCallback((id: string | null) => {
    setSelectedBoxIds(id ? [id] : []);
  }, []);

  const handleSelectBox = useCallback((id: string, selectMultiple?: boolean) => {
    setSelectedBoxIds(prev => {
      if (selectMultiple) {
        if (prev.includes(id)) {
          return prev.filter(x => x !== id);
        } else {
          return [...prev, id];
        }
      } else {
        return [id];
      }
    });
  }, []);

  const [copiedBoxes, setCopiedBoxes] = useState<PackedBox[]>([]);
  const [checkpoint, setCheckpoint] = useState<PackingResult[] | null>(null);
  const [boxSurfaceDirection, setBoxSurfaceDirection] = useState<'default' | 'alternate' | 'height-max' | 'height-min'>('default');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Invoice & Brand States
  const [invoiceTitle, setInvoiceTitle] = useState('INV-2026-001');
  const [brandName, setBrandName] = useState('Millinks');
  const [savedInvoiceSlots, setSavedInvoiceSlots] = useState<{
    id: string;
    invoiceTitle: string;
    brandName: string;
    containers: ContainerInstance[];
    results: PackingResult[];
    boxSurfaceDirection: 'default' | 'alternate' | 'height-max' | 'height-min';
    autoSettle: boolean;
    savedAt: string;
    containersCount: number;
  }[]>(() => {
    try {
      const saved = localStorage.getItem('savedInvoiceSlots');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveInvoiceToSlots = () => {
    const newSlot = {
      id: generateId(),
      invoiceTitle: invoiceTitle.trim() || 'Untitled Invoice',
      brandName: brandName.trim() || 'Default Brand',
      containers: JSON.parse(JSON.stringify(containers)),
      results: JSON.parse(JSON.stringify(results)),
      boxSurfaceDirection,
      autoSettle,
      savedAt: new Date().toISOString(),
      containersCount: containers.length
    };
    const updated = [newSlot, ...savedInvoiceSlots];
    setSavedInvoiceSlots(updated);
    localStorage.setItem('savedInvoiceSlots', JSON.stringify(updated));
    setExportSuccessMessage("Invoice saved to browser memory slot!");
    setTimeout(() => setExportSuccessMessage(null), 3000);
  };

  const loadInvoiceFromSlot = (slot: any) => {
    setInvoiceTitle(slot.invoiceTitle);
    setBrandName(slot.brandName);
    setBoxSurfaceDirection(slot.boxSurfaceDirection || 'default');
    setAutoSettle(slot.autoSettle !== undefined ? slot.autoSettle : true);
    commitState(slot.containers, slot.results || []);
    setExportSuccessMessage(`Loaded "${slot.invoiceTitle}" successfully!`);
    setTimeout(() => setExportSuccessMessage(null), 3000);
  };

  const deleteInvoiceSlot = (id: string) => {
    const updated = savedInvoiceSlots.filter(s => s.id !== id);
    setSavedInvoiceSlots(updated);
    localStorage.setItem('savedInvoiceSlots', JSON.stringify(updated));
    setExportSuccessMessage("Invoice slot deleted.");
    setTimeout(() => setExportSuccessMessage(null), 3000);
  };

  const downloadInvoiceAsFile = () => {
    const configData = {
      fileType: "GodhandInvoiceCheckpoint",
      version: "1.0",
      invoiceTitle: invoiceTitle.trim() || 'Untitled Invoice',
      brandName: brandName.trim() || 'Default Brand',
      boxSurfaceDirection,
      autoSettle,
      containers,
      results
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${brandName.trim().toLowerCase().replace(/\s+/g, '-')}-${invoiceTitle.trim().toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportSuccessMessage("Checkpoint file downloaded successfully!");
    setTimeout(() => setExportSuccessMessage(null), 3000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const processLoadedFile = (fileText: string) => {
    try {
      const data = JSON.parse(fileText);
      if (data.fileType === "GodhandInvoiceCheckpoint" || data.containers) {
        setInvoiceTitle(data.invoiceTitle || 'Imported Invoice');
        setBrandName(data.brandName || 'Imported Brand');
        if (data.boxSurfaceDirection) setBoxSurfaceDirection(data.boxSurfaceDirection);
        if (data.autoSettle !== undefined) setAutoSettle(data.autoSettle);
        commitState(data.containers, data.results || []);
        setExportSuccessMessage("Invoice loaded successfully from file!");
        setTimeout(() => setExportSuccessMessage(null), 3000);
      } else {
        alert("Invalid file format. Please upload a valid Godhand Packing Checkpoint file.");
      }
    } catch (err) {
      console.error(err);
      alert("Error reading checkpoint file. Make sure it's a valid JSON file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processLoadedFile(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processLoadedFile(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };
  
  // Custom Render & Timeline Options
  const [renderOptions, setRenderOptions] = useState({
    showCabin: true,
    showNet: true,
    showTruck: true,
    showLabels: true
  });
  const [timelineStep, setTimelineStep] = useState<number | null>(null);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);

  const orbitRef = useRef<any>(null);

  const uniqueModels = useMemo(() => Array.from(new Set(modelLibrary.map(m => m.model))), [modelLibrary]);

  const pushToHistory = useCallback((newContainers: ContainerInstance[], newResults: PackingResult[]) => {
    const state: HistoryState = {
      containers: JSON.parse(JSON.stringify(newContainers)),
      results: JSON.parse(JSON.stringify(newResults))
    };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => {
      const next = prev + 1;
      return next >= 50 ? 49 : next;
    });
  }, [historyIndex]);

  const commitState = useCallback((newContainers: ContainerInstance[], newResults: PackingResult[]) => {
    setContainers(newContainers);
    setResults(newResults);
    pushToHistory(newContainers, newResults);
  }, [pushToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const state = JSON.parse(JSON.stringify(history[prevIndex])) as HistoryState;
      setContainers(state.containers);
      setResults(state.results);
      setHistoryIndex(prevIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = JSON.parse(JSON.stringify(history[nextIndex])) as HistoryState;
      setContainers(state.containers);
      setResults(state.results);
      setHistoryIndex(nextIndex);
    }
  }, [history, historyIndex]);

  // Initial history push
  useEffect(() => {
    if (historyIndex === -1) {
      pushToHistory(containers, results);
    }
  }, []);

  const totalPackedBoxes = useMemo(() => {
    return results.reduce((sum, r) => sum + r.packedBoxes.length, 0);
  }, [results]);

  const getCurrentBoxInfo = useCallback((idx: number) => {
    let count = 0;
    for (const r of results) {
      if (idx >= count && idx < count + r.packedBoxes.length) {
        const box = r.packedBoxes[idx - count];
        return `${box.modelInfo} at (${Math.round(box.x)}mm, ${Math.round(box.y)}mm, ${Math.round(box.z)}mm)`;
      }
      count += r.packedBoxes.length;
    }
    return '';
  }, [results]);

  const setCameraAngle = useCallback((angleType: 'iso' | 'rear' | 'front' | 'side' | 'top') => {
    if (!orbitRef.current) return;
    const controls = orbitRef.current;
    const camera = controls.object;
    
    const activeContType = results[0]?.containerType || '40GP';
    const cType = CONTAINER_TYPES[activeContType];
    const s = 0.001;
    const halfL = (cType.width * s) / 2;
    const halfH = (cType.height * s) / 2;
    const halfW = (cType.depth * s) / 2;

    switch (angleType) {
      case 'iso':
        camera.position.set(25, 20, 25);
        controls.target.set(halfL, halfH, halfW);
        break;
      case 'rear':
        camera.position.set(cType.width * s + 8, halfH + 2, halfW);
        controls.target.set(halfL, halfH, halfW);
        break;
      case 'front':
        camera.position.set(-6, halfH + 3, halfW);
        controls.target.set(halfL, halfH, halfW);
        break;
      case 'side':
        camera.position.set(halfL, halfH, halfW + 18);
        controls.target.set(halfL, halfH, halfW);
        break;
      case 'top':
        camera.position.set(halfL, 25, halfW);
        controls.target.set(halfL, halfH, halfW);
        break;
    }
    controls.update();
  }, [results]);

  // Autoplay Timeline Sequence
  useEffect(() => {
    let interval: any = null;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setTimelineStep(prev => {
          if (prev === null) {
            if (totalPackedBoxes > 0) return 1;
            return null;
          }
          if (prev >= totalPackedBoxes) {
            setIsPlayingTimeline(false);
            return null; // completed
          }
          return prev + 1;
        });
      }, 350);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline, totalPackedBoxes]);

  const runPacking = () => {
    setIsPacking(true);
    setSelectedBoxId(null);
    setTimeout(() => {
      const packed = packBoxesOptimized(containers, modelLibrary, boxSurfaceDirection);
      commitState(containers, packed);
      setIsPacking(false);
      setMode('auto');
    }, 400);
  };

  const rotateSelectedBox = useCallback(() => {
    if (!selectedBoxId || mode !== 'manual') return;
    const newResults = JSON.parse(JSON.stringify(results)) as PackingResult[];
    let changed = false;
    for (const r of newResults) {
      const boxIndex = r.packedBoxes.findIndex(b => b.id === selectedBoxId);
      if (boxIndex !== -1) {
        const box = r.packedBoxes[boxIndex];
        const dims = [box.width, box.height, box.depth];
        const perms: [number, number, number][] = [
          [dims[0], dims[2], dims[1]],
          [dims[1], dims[0], dims[2]],
          [dims[1], dims[2], dims[0]],
          [dims[2], dims[0], dims[1]],
          [dims[2], dims[1], dims[0]],
          [dims[0], dims[1], dims[2]],
        ];
        
        for (const [nw, nh, nd] of perms) {
          if (nw === box.width && nh === box.height && nd === box.depth) continue;
          const rotated = { ...box, width: nw, height: nh, depth: nd };
          const netX = r.hasNet ? r.packedBoxes.reduce((max, b) => Math.max(max, b.x + b.width), 0) + 50 : undefined;
          if (!checkCollision(rotated, r.packedBoxes, r.containerType, netX)) {
            r.packedBoxes[boxIndex] = rotated;
            changed = true;
            break;
          }
        }
      }
    }
    if (changed) commitState(containers, newResults);
  }, [selectedBoxId, mode, results, containers, commitState]);

  const rotateSelectedBoxAxis = useCallback((axis: 'X' | 'Y' | 'Z') => {
    if (!selectedBoxId || mode !== 'manual') return;
    const newResults = JSON.parse(JSON.stringify(results)) as PackingResult[];
    let changed = false;
    for (const r of newResults) {
      const boxIndex = r.packedBoxes.findIndex(b => b.id === selectedBoxId);
      if (boxIndex !== -1) {
        const box = r.packedBoxes[boxIndex];
        let nw = box.width;
        let nh = box.height;
        let nd = box.depth;
        
        if (axis === 'X') {
          nh = box.depth;
          nd = box.height;
        } else if (axis === 'Y') {
          nw = box.depth;
          nd = box.width;
        } else if (axis === 'Z') {
          nw = box.height;
          nh = box.width;
        }
        
        r.packedBoxes[boxIndex] = {
          ...box,
          width: nw,
          height: nh,
          depth: nd
        };
        changed = true;
        break;
      }
    }
    if (changed) commitState(containers, newResults);
  }, [selectedBoxId, mode, results, containers, commitState]);

  const settleSelectedBox = useCallback(() => {
    if (!selectedBoxId || mode !== 'manual') return;
    const newResults = JSON.parse(JSON.stringify(results)) as PackingResult[];
    let changed = false;
    for (const r of newResults) {
      const boxIndex = r.packedBoxes.findIndex(b => b.id === selectedBoxId);
      if (boxIndex !== -1) {
        const box = r.packedBoxes[boxIndex];
        const netX = r.hasNet ? r.packedBoxes.reduce((max, b) => Math.max(max, b.x + b.width), 0) + 50 : undefined;
        // Find best rotation around current position
        const bestFit = findBestRotation(box.x + box.width / 2, box.y + box.height / 2, box.z + box.depth / 2, box, r.packedBoxes, r.containerType, netX);
        const sourceBox = bestFit || box;
        const settledBox = applyGravity(sourceBox, r.packedBoxes, r.containerType, netX);
        r.packedBoxes[boxIndex] = {
          ...box,
          x: settledBox.x,
          y: settledBox.y,
          z: settledBox.z,
          width: settledBox.width,
          height: settledBox.height,
          depth: settledBox.depth
        };
        changed = true;
      }
    }
    if (changed) commitState(containers, newResults);
  }, [selectedBoxId, mode, results, containers, commitState]);

  const tidyAllContainers = useCallback(() => {
    if (results.length === 0) return;
    const newResults = JSON.parse(JSON.stringify(results)) as PackingResult[];
    let changed = false;

    newResults.forEach(r => {
      const originalCount = r.packedBoxes.length;
      if (originalCount === 0) return;

      // Sort boxes according to the position of the interface direction of the boxes
      // x is length (innermost first), y is height (bottom-most first), z is depth (right-most first)
      const sortedBoxes = [...r.packedBoxes].sort((a, b) => {
        if (Math.abs(a.x - b.x) > 10) return a.x - b.x;
        if (Math.abs(a.y - b.y) > 10) return a.y - b.y;
        return a.z - b.z;
      });

      const tidiedBoxes: PackedBox[] = [];
      const netX = r.hasNet ? sortedBoxes.reduce((max, b) => Math.max(max, b.x + b.width), 0) + 50 : undefined;
      const cType = CONTAINER_TYPES[r.containerType];

      sortedBoxes.forEach(box => {
        let current = { ...box };

        // 1. Clamp to container boundaries first
        current.x = Math.max(0, Math.min(cType.width - current.width, current.x));
        current.y = Math.max(0, Math.min(cType.height - current.height, current.y));
        current.z = Math.max(0, Math.min(cType.depth - current.depth, current.z));

        // 2. Resolve initial overlap by finding a free space along X if colliding
        let collision = checkCollision(current, tidiedBoxes, r.containerType, netX);
        if (collision) {
          let testX = current.x;
          while (testX <= cType.width - current.width && checkCollision({ ...current, x: testX }, tidiedBoxes, r.containerType, netX)) {
            testX += 10;
          }
          if (testX <= cType.width - current.width) {
            current.x = testX;
          } else {
            // Find any valid Y/Z coordinate that is free
            const possibleYZs: {y: number, z: number}[] = [{ y: 0, z: 0 }];
            tidiedBoxes.forEach(b => {
              possibleYZs.push({ y: b.y + b.height, z: b.z });
              possibleYZs.push({ y: b.y, z: b.z + b.depth });
            });

            possibleYZs.sort((a, b) => {
              if (a.y !== b.y) return a.y - b.y;
              return a.z - b.z;
            });

            for (const p of possibleYZs) {
              if (p.y + current.height > cType.height || p.z + current.depth > cType.depth) continue;
              let testX2 = 0;
              while (testX2 <= cType.width - current.width && checkCollision({ ...current, x: testX2, y: p.y, z: p.z }, tidiedBoxes, r.containerType, netX)) {
                testX2 += 10;
              }
              if (testX2 <= cType.width - current.width) {
                current.x = testX2;
                current.y = p.y;
                current.z = p.z;
                break;
              }
            }
          }
        }

        // 3. Dense multi-pass sliding settlement
        // Pass A: Slide back (X)
        let settled = false;
        while (!settled) {
          let next = { ...current, x: current.x - 10 };
          if (next.x < 0 || checkCollision(next, tidiedBoxes, r.containerType, netX)) {
            settled = true;
          } else {
            current = next;
          }
        }

        // Pass B: Slide down (Y)
        settled = false;
        while (!settled) {
          let next = { ...current, y: current.y - 10 };
          if (next.y < 0 || checkCollision(next, tidiedBoxes, r.containerType, netX)) {
            settled = true;
          } else {
            current = next;
          }
        }

        // Pass C: Slide sideways (Z)
        settled = false;
        while (!settled) {
          let next = { ...current, z: current.z - 10 };
          if (next.z < 0 || checkCollision(next, tidiedBoxes, r.containerType, netX)) {
            settled = true;
          } else {
            current = next;
          }
        }

        // Pass D: Double-check Slide back (X)
        settled = false;
        while (!settled) {
          let next = { ...current, x: current.x - 10 };
          if (next.x < 0 || checkCollision(next, tidiedBoxes, r.containerType, netX)) {
            settled = true;
          } else {
            current = next;
          }
        }

        // Pass E: Double-check Slide down (Y)
        settled = false;
        while (!settled) {
          let next = { ...current, y: current.y - 10 };
          if (next.y < 0 || checkCollision(next, tidiedBoxes, r.containerType, netX)) {
            settled = true;
          } else {
            current = next;
          }
        }

        tidiedBoxes.push(current);
      });

      r.packedBoxes = tidiedBoxes;
      changed = true;
    });

    if (changed) commitState(containers, newResults);
  }, [results, containers, commitState]);

  const handleCopyToClipboard = useCallback(() => {
    if (results.length === 0) return;
    
    let summary = `GODHAND - CONTAINER PACKING REPORT\n`;
    summary += `Generated on: ${new Date().toLocaleString()}\n`;
    summary += `========================================\n\n`;
    
    results.forEach((r, idx) => {
      const density = ((r.packedVolume / r.totalVolume) * 100).toFixed(1);
      const emptySpace = (100 - parseFloat(density)).toFixed(1);
      const packedM3 = (r.packedVolume / 1e9).toFixed(2);
      const totalM3 = (r.totalVolume / 1e9).toFixed(2);
      const wastedM3 = ((r.totalVolume - r.packedVolume) / 1e9).toFixed(2);
      
      let orientationDesc = 'Default (Wall-Hugging)';
      if (boxSurfaceDirection === 'alternate') {
        orientationDesc = 'Alternate (Length-Wise)';
      } else if (boxSurfaceDirection === 'height-max') {
        orientationDesc = 'Upright (Height-Maximized)';
      } else if (boxSurfaceDirection === 'height-min') {
        orientationDesc = 'Flat Stable (Height-Minimized)';
      }
      
      summary += `UNIT #${idx + 1}: ${r.containerType}\n`;
      summary += `----------------------------------------\n`;
      summary += `- Stacking Orientation: ${orientationDesc}\n`;
      summary += `- Total Packed Volume: ${packedM3} m³ of ${totalM3} m³ (${density}% Dense)\n`;
      summary += `- Unused/Wasted Volume: ${wastedM3} m³ (${emptySpace}% Empty Space)\n`;
      summary += `- Total Cargo Box Units: ${r.packedBoxes.length} boxes\n`;
      
      // Group packed cargo by model
      const packedCountMap: Record<string, number> = {};
      r.packedBoxes.forEach(b => {
        packedCountMap[b.modelInfo] = (packedCountMap[b.modelInfo] || 0) + 1;
      });
      
      summary += `- Packed Cargo Breakdown:\n`;
      Object.entries(packedCountMap).forEach(([modelInfo, qty]) => {
        summary += `  • ${modelInfo}: ${qty} units\n`;
      });
      
      if (r.unfitItems.length > 0) {
        summary += `- Surplus Inventory (Unfit):\n`;
        r.unfitItems.forEach(u => {
          summary += `  • ${u.model} (${u.size}"): ${u.count} unfit\n`;
        });
      }
      summary += `\n`;
    });
    
    summary += `========================================\n`;
    
    navigator.clipboard.writeText(summary)
      .then(() => {
        setExportSuccessMessage("Summary report copied to clipboard!");
        setTimeout(() => setExportSuccessMessage(null), 3000);
      })
      .catch(err => {
        console.error("Failed to copy report:", err);
        alert("Failed to copy to clipboard.");
      });
  }, [results, boxSurfaceDirection]);

  const handleExportReport = useCallback(() => {
    if (results.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to export the PDF report.");
      return;
    }

    let reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>GODHAND - Container Packing Logistics Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: #1e293b;
            background: #fff;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-area h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.03em;
            color: #0f172a;
            text-transform: uppercase;
          }
          .logo-area p {
            margin: 5px 0 0 0;
            color: #64748b;
            font-weight: 500;
            font-size: 12px;
          }
          .meta-area {
            text-align: right;
            font-size: 12px;
            color: #475569;
          }
          .meta-area p {
            margin: 3px 0;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin: 30px 0 15px 0;
            color: #0f172a;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 25px;
          }
          .metric-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .metric-card .value {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 5px;
          }
          .metric-card .label {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          th {
            background: #0f172a;
            color: #fff;
            text-align: left;
            padding: 10px 12px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
          }
          tr:nth-child(even) td {
            background: #f8fafc;
          }
          .unfit-box {
            background: #fff5f5;
            border: 1.5px dashed #fca5a5;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 25px;
          }
          .unfit-box h4 {
            margin: 0 0 10px 0;
            color: #c53030;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .unfit-item {
            font-size: 13px;
            color: #9b2c2c;
            margin: 4px 0;
          }
          .footer {
            margin-top: 60px;
            border-top: 1px solid #cbd5e1;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
          }
          .signature-space {
            margin-top: 40px;
            border-top: 1px solid #64748b;
            width: 200px;
            text-align: center;
            padding-top: 8px;
            font-size: 12px;
            font-weight: 600;
          }
          @media print {
            body {
              padding: 0;
            }
            button {
              display: none;
            }
          }
          .print-btn {
            background: #0f172a;
            color: #fff;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 20px;
            display: inline-block;
          }
          .print-btn:hover {
            background: #1e293b;
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        </div>
        
        <div class="header">
          <div class="logo-area">
            <h1>${brandName ? brandName : 'Godhand Logistics'}</h1>
            <p>High-Density 3D Container Stuffing Manifest</p>
          </div>
          <div class="meta-area">
            <p><strong>Invoice / Ref:</strong> ${invoiceTitle || 'N/A'}</p>
            <p><strong>Report Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Stacking Heuristic:</strong> ${
              boxSurfaceDirection === 'default' ? 'Default (Wall-Hugging)' :
              boxSurfaceDirection === 'alternate' ? 'Alternate (Length-Wise)' :
              boxSurfaceDirection === 'height-max' ? 'Upright (Height-Maximized)' : 'Flat Stable (Height-Minimized)'
            }</p>
          </div>
        </div>
    `;

    results.forEach((r, idx) => {
      const density = ((r.packedVolume / r.totalVolume) * 100).toFixed(1);
      const emptySpace = (100 - parseFloat(density)).toFixed(1);
      const packedM3 = (r.packedVolume / 1e9).toFixed(2);
      const totalM3 = (r.totalVolume / 1e9).toFixed(2);
      const wastedM3 = ((r.totalVolume - r.packedVolume) / 1e9).toFixed(2);

      const packedCountMap: Record<string, { qty: number, color: string, sample: PackedBox }> = {};
      r.packedBoxes.forEach(b => {
        if (!packedCountMap[b.modelInfo]) {
          packedCountMap[b.modelInfo] = { qty: 0, color: b.color, sample: b };
        }
        packedCountMap[b.modelInfo].qty += 1;
      });

      reportHtml += `
        <div class="section-title">UNIT #${idx + 1}: ${r.containerType} CONTAINER SPECIFICATION</div>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="label">Packed Density</div>
            <div class="value" style="color: #10b981;">${density}%</div>
          </div>
          <div class="metric-card">
            <div class="label">Empty / Wasted Space</div>
            <div class="value" style="color: #ef4444;">${emptySpace}%</div>
          </div>
          <div class="metric-card">
            <div class="label">Total Volume Packed</div>
            <div class="value">${packedM3} m³</div>
          </div>
          <div class="metric-card">
            <div class="label">Total Cargo Units</div>
            <div class="value">${r.packedBoxes.length} pcs</div>
          </div>
        </div>

        <h3 style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.02em;">Packed Cargo Manifest</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">Color</th>
              <th>Cargo Model Information</th>
              <th style="text-align: right;">Unit Length</th>
              <th style="text-align: right;">Unit Width</th>
              <th style="text-align: right;">Unit Height</th>
              <th style="text-align: right; width: 80px;">Quantity</th>
              <th style="text-align: right; width: 120px;">Total Vol (m³)</th>
            </tr>
          </thead>
          <tbody>
      `;

      Object.entries(packedCountMap).forEach(([modelInfo, data]) => {
        const itemVol = (data.sample.width * data.sample.height * data.sample.depth) / 1e9;
        const totalItemVol = itemVol * data.qty;
        reportHtml += `
          <tr>
            <td style="text-align: center;"><div style="width: 14px; height: 14px; border-radius: 3px; background: ${data.color}; border: 1px solid rgba(0,0,0,0.15); display: inline-block;"></div></td>
            <td><strong>${modelInfo}</strong></td>
            <td style="text-align: right;">${data.sample.width} mm</td>
            <td style="text-align: right;">${data.sample.depth} mm</td>
            <td style="text-align: right;">${data.sample.height} mm</td>
            <td style="text-align: right;"><strong>${data.qty}</strong></td>
            <td style="text-align: right;">${totalItemVol.toFixed(3)} m³</td>
          </tr>
        `;
      });

      reportHtml += `
          </tbody>
        </table>
      `;

      if (r.unfitItems.length > 0) {
        reportHtml += `
          <div class="unfit-box">
            <h4>Surplus / Unfit Cargo (Exceeded Container Capacity)</h4>
            ${r.unfitItems.map(u => `
              <div class="unfit-item">• <strong>${u.model} (${u.size}")</strong>: ${u.count} units could not fit.</div>
            `).join('')}
          </div>
        `;
      }
    });

    reportHtml += `
        <div style="display: flex; justify-content: space-between; margin-top: 80px;">
          <div class="signature-space">
            Prepared By (Logistics Clerk)
          </div>
          <div class="signature-space">
            Approved By (Warehouse Manager)
          </div>
        </div>

        <div class="footer">
          <span>Godhand Container Packing — Advanced Space Optimization System</span>
          <span>Page 1 of 1</span>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
    
    setExportSuccessMessage("Logistics PDF Report generated!");
    setTimeout(() => setExportSuccessMessage(null), 3000);
  }, [results, boxSurfaceDirection]);

  const copySelectedBoxes = useCallback(() => {
    if (selectedBoxIds.length === 0) return;
    const matched: PackedBox[] = [];
    results.forEach(r => {
      r.packedBoxes.forEach(b => {
        if (selectedBoxIds.includes(b.id)) {
          matched.push({ ...b });
        }
      });
    });
    if (matched.length > 0) {
      setCopiedBoxes(matched);
    }
  }, [selectedBoxIds, results]);

  const pasteCopiedBoxes = useCallback(() => {
    if (copiedBoxes.length === 0 || results.length === 0) return;

    let targetContainerId = results[0].containerId;
    if (selectedBoxIds.length > 0) {
      for (const r of results) {
        if (r.packedBoxes.some(b => b.id === selectedBoxIds[0])) {
          targetContainerId = r.containerId;
          break;
        }
      }
    }

    const nextResults = JSON.parse(JSON.stringify(results)) as PackingResult[];
    const nextContainers = JSON.parse(JSON.stringify(containers)) as ContainerInstance[];

    const targetResult = nextResults.find(r => r.containerId === targetContainerId);
    const targetContainer = nextContainers.find(c => c.id === targetContainerId);

    if (!targetResult || !targetContainer) return;

    const newPastedIds: string[] = [];
    const pastedBoxes: PackedBox[] = copiedBoxes.map(box => {
      const newBoxId = generateId();
      newPastedIds.push(newBoxId);

      const cargoItem = targetContainer.items.find(item => item.id === box.itemId || (item.model === box.modelInfo.split(' (')[0]));
      if (cargoItem) {
        cargoItem.qty += 1;
      }

      return {
        ...box,
        id: newBoxId,
        x: Math.max(0, box.x + 100),
        y: box.y + 400,
        z: box.z
      };
    });

    targetResult.packedBoxes.push(...pastedBoxes);
    commitState(nextContainers, nextResults);
    setSelectedBoxIds(newPastedIds);
  }, [copiedBoxes, results, containers, selectedBoxIds, commitState]);

  const deleteSelectedBox = useCallback(() => {
    if (selectedBoxIds.length === 0 || mode !== 'manual') return;

    const nextContainers = JSON.parse(JSON.stringify(containers)) as ContainerInstance[];
    const nextResults = JSON.parse(JSON.stringify(results)) as PackingResult[];

    for (const id of selectedBoxIds) {
      for (const r of nextResults) {
        const box = r.packedBoxes.find(b => b.id === id);
        if (box) {
          const targetCont = nextContainers.find(c => c.id === r.containerId);
          if (targetCont) {
            const cargoItem = targetCont.items.find(item => item.id === box.itemId || (item.model === box.modelInfo.split(' (')[0]));
            if (cargoItem && cargoItem.qty > 0) {
              cargoItem.qty -= 1;
            }
          }
          break;
        }
      }
    }

    nextResults.forEach(r => {
      r.packedBoxes = r.packedBoxes.filter(b => !selectedBoxIds.includes(b.id));
    });

    commitState(nextContainers, nextResults);
    setSelectedBoxIds([]);
  }, [selectedBoxIds, mode, results, containers, commitState]);

  const moveSelectedBox = useCallback((direction: string) => {
    if (mode !== 'manual') return;
    
    if (!selectedBoxId) {
      // Camera panning if no box selected
      const step = 0.5;
      if (orbitRef.current) {
        const controls = orbitRef.current;
        if (direction === 'w') controls.target.x -= step;
        if (direction === 's') controls.target.x += step;
        if (direction === 'a') controls.target.z += step;
        if (direction === 'd') controls.target.z -= step;
        if (direction === 'q') controls.object.position.y += step;
        if (direction === 'e') controls.object.position.y -= step;
        controls.update();
      }
      return;
    }

    const step = 50; // 50mm steps
    const newResults = JSON.parse(JSON.stringify(results)) as PackingResult[];
    let changed = false;
    for (const r of newResults) {
      const boxIndex = r.packedBoxes.findIndex(b => b.id === selectedBoxId);
      if (boxIndex !== -1) {
        const box = r.packedBoxes[boxIndex];
        let next = { ...box };
        if (direction === 'arrowup') next.y += step;
        if (direction === 'arrowdown') next.y -= step;
        if (direction === 'arrowleft') next.z += step;
        if (direction === 'arrowright') next.z -= step;
        if (direction === 'w') next.x -= step;
        if (direction === 's') next.x += step;

        const netX = r.hasNet ? r.packedBoxes.reduce((max, b) => Math.max(max, b.x + b.width), 0) + 50 : undefined;
        if (autoSettle) {
          const centerX = next.x + next.width / 2;
          const centerY = next.y + next.height / 2;
          const centerZ = next.z + next.depth / 2;
          const bestFit = findBestRotation(centerX, centerY, centerZ, next, r.packedBoxes, r.containerType, netX);
          if (bestFit) {
            const settledBox = applyGravity(bestFit, r.packedBoxes, r.containerType, netX);
            r.packedBoxes[boxIndex] = {
              ...box,
              x: settledBox.x,
              y: settledBox.y,
              z: settledBox.z,
              width: settledBox.width,
              height: settledBox.height,
              depth: settledBox.depth
            };
            changed = true;
          } else {
            if (!checkCollision(next, r.packedBoxes, r.containerType, netX)) {
              r.packedBoxes[boxIndex] = next;
              changed = true;
            }
          }
        } else {
          if (!checkCollision(next, r.packedBoxes, r.containerType, netX)) {
            r.packedBoxes[boxIndex] = next;
            changed = true;
          }
        }
      }
    }
    if (changed) commitState(containers, newResults);
  }, [selectedBoxId, mode, results, containers, commitState, autoSettle]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isCtrl && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (isCtrl && key === 'y') {
        e.preventDefault();
        redo();
      } else if (isCtrl && key === 'c') {
        if (mode === 'manual' && selectedBoxIds.length > 0) {
          e.preventDefault();
          copySelectedBoxes();
        }
      } else if (isCtrl && key === 'v') {
        if (mode === 'manual' && copiedBoxes.length > 0) {
          e.preventDefault();
          pasteCopiedBoxes();
        }
      } else if (key === 'r') {
        if (mode === 'manual' && selectedBoxIds.length > 0) {
          setTransformMode(prev => prev === 'translate' ? 'rotate' : 'translate');
        }
      } else if (key === 't') {
        if (mode === 'manual' && selectedBoxIds.length > 0) {
          rotateSelectedBox();
        }
      } else if (key === 'g') {
        if (mode === 'manual') {
          e.preventDefault();
          setAutoSettle(prev => !prev);
        }
      } else if (key === 'x') {
        if (mode === 'manual' && selectedBoxIds.length > 0) {
          e.preventDefault();
          rotateSelectedBoxAxis('X');
        }
      } else if (key === 'y' && !isCtrl) {
        if (mode === 'manual' && selectedBoxIds.length > 0) {
          e.preventDefault();
          rotateSelectedBoxAxis('Y');
        }
      } else if (key === 'z' && !isCtrl) {
        if (mode === 'manual' && selectedBoxIds.length > 0) {
          e.preventDefault();
          rotateSelectedBoxAxis('Z');
        }
      } else if (key === 'delete' || key === 'backspace') {
        if (mode === 'manual' && selectedBoxIds.length > 0) {
          e.preventDefault();
          deleteSelectedBox();
        }
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd', 'q', 'e'].includes(key)) {
        if (mode === 'manual') {
          e.preventDefault();
          moveSelectedBox(key);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, rotateSelectedBox, rotateSelectedBoxAxis, deleteSelectedBox, moveSelectedBox, copySelectedBoxes, pasteCopiedBoxes, mode, selectedBoxIds, copiedBoxes]);

  const saveCheckpoint = () => {
    setCheckpoint(JSON.parse(JSON.stringify(results)));
    alert("Checkpoint saved!");
  };

  const loadCheckpoint = () => {
    if (checkpoint) {
      commitState(containers, JSON.parse(JSON.stringify(checkpoint)));
    }
  };

  const toggleNet = (containerId: string) => {
    const next = results.map(r => r.containerId === containerId ? { ...r, hasNet: !r.hasNet } : r);
    const nextContainers = containers.map(c => c.id === containerId ? { ...c, hasNet: !c.hasNet } : c);
    commitState(nextContainers, next);
  };

  const onUpdateBox = useCallback((containerId: string, boxId: string, updates: Partial<PackedBox>) => {
    let originalBox: PackedBox | undefined = undefined;
    for (const r of results) {
      if (r.containerId === containerId) {
        originalBox = r.packedBoxes.find(b => b.id === boxId);
        break;
      }
    }

    if (!originalBox) return;

    const dx = updates.x !== undefined ? updates.x - originalBox.x : 0;
    const dy = updates.y !== undefined ? updates.y - originalBox.y : 0;
    const dz = updates.z !== undefined ? updates.z - originalBox.z : 0;

    const useGroupUpdate = selectedBoxIds.includes(boxId) && selectedBoxIds.length > 1;

    const next = results.map(r => {
      if (r.containerId === containerId) {
        return {
          ...r,
          packedBoxes: r.packedBoxes.map(b => {
            if (useGroupUpdate && selectedBoxIds.includes(b.id)) {
              return {
                ...b,
                x: b.x + dx,
                y: b.y + dy,
                z: b.z + dz
              };
            } else if (b.id === boxId) {
              return { ...b, ...updates };
            }
            return b;
          })
        };
      }
      return r;
    });
    commitState(containers, next);
  }, [results, containers, commitState, selectedBoxIds]);

  const addContainer = () => commitState([...containers, { id: generateId(), type: '20GP', items: [] }], results);
  const removeContainer = (id: string) => commitState(containers.filter(c => c.id !== id), results.filter(r => r.containerId !== id));
  const addCargoItem = (containerId: string) => {
    const next = containers.map(c => c.id === containerId ? { ...c, items: [...c.items, { id: generateId(), model: uniqueModels[0], size: '', qty: 50, color: COLORS[c.items.length % COLORS.length] }] } : c);
    commitState(next, results);
  };
  const updateCargoItem = (containerId: string, itemId: string, updates: Partial<CargoItem>) => {
    const next = containers.map(c => c.id === containerId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...updates } : i) } : c);
    commitState(next, results);
  };
  const removeCargoItem = (containerId: string, itemId: string) => {
    const next = containers.map(c => c.id === containerId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c);
    commitState(next, results);
  };
  const moveCargoItem = (containerId: string, index: number, direction: 'up' | 'down') => {
    const next = containers.map(c => {
      if (c.id === containerId) {
        const newItems = [...c.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newItems.length) { [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]; }
        return { ...c, items: newItems };
      }
      return c;
    });
    commitState(next, results);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#f8fafc' }}>
      <div style={{ width: '460px', height: '100%', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px', boxShadow: '4px 0 20px rgba(0,0,0,0.02)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
          <div style={{ background: '#000', padding: '10px', borderRadius: '12px' }}><LucideTruck size={24} color="#fff" /></div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: '#000' }}>Millinks Space Logic AI</h1>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <LucideShieldCheck size={10} color="#10b981" fill="#10b981" />
              <span style={{ fontSize: '0.6rem', color: '#000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Density: Tier-Optimized</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Labels 1-4 indicate stuffing sequence</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px', paddingRight: '8px' }}>
          {/* Invoice & Brand Configuration Panel */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }} id="invoice-manager-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LucideClipboard size={14} color="#475569" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Invoice & Brand Configuration
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.58rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Invoice Title/No.</label>
                <input 
                  type="text" 
                  value={invoiceTitle} 
                  onChange={e => setInvoiceTitle(e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', color: '#000', fontWeight: 700 }}
                  id="invoice-title-input"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.58rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Brand Name</label>
                <input 
                  type="text" 
                  value={brandName} 
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="e.g. Millinks"
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', color: '#000', fontWeight: 700 }}
                  id="invoice-brand-input"
                />
              </div>
            </div>

            {/* Drag-and-Drop Area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: isDraggingFile ? '2px dashed #3b82f6' : '1px dashed #cbd5e1',
                background: isDraggingFile ? '#eff6ff' : '#fff',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onClick={() => fileInputRef.current?.click()}
              id="invoice-dropzone"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".json" 
                style={{ display: 'none' }} 
              />
              <LucideDownload size={16} color={isDraggingFile ? '#3b82f6' : '#64748b'} style={{ margin: '0 auto 4px auto', display: 'block' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', display: 'block' }}>
                {isDraggingFile ? 'Drop file here!' : 'Drag & Drop Checkpoint File (.json)'}
              </span>
              <span style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
                Or click to browse computer
              </span>
            </div>

            {/* Save / Download Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={saveInvoiceToSlots}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  height: '28px',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                title="Save this invoice setup to browser memory slots"
                id="save-invoice-slot-btn"
              >
                <LucideSave size={11} /> Save Slot
              </button>
              <button
                type="button"
                onClick={downloadInvoiceAsFile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  height: '28px',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                title="Download invoice as a JSON checkpoint file"
                id="download-invoice-file-btn"
              >
                <LucideDownload size={11} /> Download File
              </button>
            </div>

            {/* Saved Slots Directory */}
            {savedInvoiceSlots.length > 0 && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.58rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  Saved Browser Invoices ({savedInvoiceSlots.length})
                </span>
                <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {savedInvoiceSlots.map((slot, sIdx) => (
                    <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.65rem' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={`${slot.brandName} - ${slot.invoiceTitle}`}>
                        <strong style={{ color: '#0f172a' }}>{slot.invoiceTitle}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.6rem', marginLeft: '4px' }}>({slot.brandName})</span>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>
                          {slot.containersCount} Unit(s) • {new Date(slot.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => loadInvoiceFromSlot(slot)}
                          style={{
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            color: '#2563eb',
                            cursor: 'pointer'
                          }}
                          id={`load-invoice-slot-${sIdx}`}
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteInvoiceSlot(slot.id)}
                          style={{
                            border: '1px solid #fee2e2',
                            background: '#fff5f5',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            color: '#ef4444',
                            cursor: 'pointer'
                          }}
                          id={`delete-invoice-slot-${sIdx}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Database Sync Panel */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LucideDatabase size={14} color="#475569" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  MillinksDB Sync
                </span>
              </div>
              <a 
                href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`} 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}
                title="Open Google Sheet"
              >
                Open Sheet <LucideExternalLink size={10} />
              </a>
            </div>

            {isAuthLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                <LucideRefreshCw size={12} className="animate-spin" color="#64748b" />
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>Connecting with Google Auth...</span>
              </div>
            ) : !user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', lineHeight: 1.4 }}>
                  🔓 Running in <strong>Local Mode</strong>. Sign in with Google to sync and modify the shared MillinksDB spreadsheet.
                </p>

                {authError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <LucideAlertTriangle size={14} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} id="auth-error-icon" />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#991b1b' }}>Google Sign-In Blocked by Iframe</span>
                        <span style={{ fontSize: '0.62rem', color: '#7f1d1d', lineHeight: 1.3 }}>
                          Browsers block Google Auth popups inside the preview iframe. Open the app in a standalone tab to sign in securely.
                        </span>
                        <span style={{ fontSize: '0.58rem', color: '#b91c1c', marginTop: '4px', fontStyle: 'italic' }}>
                          Reason: {authError}
                        </span>
                      </div>
                    </div>
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '6px',
                        height: '26px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        transition: 'opacity 0.15s',
                        cursor: 'pointer'
                      }}
                      id="standalone-app-link"
                    >
                      <LucideExternalLink size={10} /> Open Standalone App
                    </a>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    height: '32px',
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#1f2937',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  id="google-signin-btn"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '14px', height: '14px' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Avatar" 
                        referrerPolicy="no-referrer"
                        style={{ width: '18px', height: '18px', borderRadius: '50%' }} 
                      />
                    ) : (
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user.displayName?.[0] || 'U'}
                      </div>
                    )}
                    <span style={{ fontSize: '0.68rem', color: '#1e293b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px', whiteSpace: 'nowrap' }} title={user.email}>
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#ef4444',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px'
                    }}
                    id="sheets-signout-btn"
                  >
                    <LucideLogOut size={10} /> Disconnect
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                  <button
                    type="button"
                    onClick={() => syncFromGoogleSheet(token!)}
                    disabled={isSyncing}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      height: '28px',
                      background: '#10b981',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#fff',
                      cursor: isSyncing ? 'not-allowed' : 'pointer',
                      opacity: isSyncing ? 0.8 : 1,
                    }}
                    id="sheets-refresh-btn"
                  >
                    <LucideRefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Refreshing...' : 'Refresh Database'}
                  </button>
                </div>

                {sheetStatus === 'success' && (
                  <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ● Database successfully synchronized with Google Sheets!
                  </div>
                )}
                {sheetStatus === 'error' && syncError && (
                  <div style={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>⚠️ Sync Error:</span>
                    <span style={{ fontWeight: 400, opacity: 0.9 }}>{syncError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toggle Button for Add Custom Model & Size */}
          <button 
            type="button"
            onClick={() => setShowCustomModelSec(!showCustomModelSec)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              height: '38px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: showCustomModelSec ? '#f1f5f9' : '#000',
              color: showCustomModelSec ? '#0f172a' : '#fff',
              border: showCustomModelSec ? '1.5px dashed #cbd5e1' : '1px solid #000',
              borderRadius: '10px',
              marginBottom: '16px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            id="toggle-custom-model-sec-btn"
          >
            {showCustomModelSec ? '✕ Hide Custom Model Creator' : '➕ Add Custom Model & Size'}
          </button>

          {/* Add Model & Size Section */}
          {showCustomModelSec && (
            <div style={{
              background: '#f8fafc',
              border: '2px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Add Custom Model & Size
                </span>
                <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>H * W * L on mm</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Model Name</span>
                  <input 
                    type="text" 
                    placeholder="e.g. FQ810" 
                    value={newModel} 
                    onChange={e => setNewModel(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', color: '#000', fontWeight: 700 }}
                    id="add-model-name-input"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Size</span>
                  <input 
                    type="text" 
                    placeholder="e.g. 21" 
                    value={newSize} 
                    onChange={e => setNewSize(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', color: '#000', fontWeight: 700 }}
                    id="add-model-size-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Dimensions: H * W * L (mm)</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 8px' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#94a3b8' }}>H</span>
                    <input 
                      type="number" 
                      value={newHeight || ''} 
                      placeholder="Height"
                      onChange={e => setNewHeight(parseInt(e.target.value) || 0)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.72rem', fontWeight: 700, color: '#000', textAlign: 'right' }}
                      min="1"
                      id="add-model-height"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 8px' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#94a3b8' }}>W</span>
                    <input 
                      type="number" 
                      value={newWidth || ''} 
                      placeholder="Width"
                      onChange={e => setNewWidth(parseInt(e.target.value) || 0)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.72rem', fontWeight: 700, color: '#000', textAlign: 'right' }}
                      min="1"
                      id="add-model-width"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 8px' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#94a3b8' }}>L</span>
                    <input 
                      type="number" 
                      value={newLength || ''} 
                      placeholder="Length"
                      onChange={e => setNewLength(parseInt(e.target.value) || 0)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.72rem', fontWeight: 700, color: '#000', textAlign: 'right' }}
                      min="1"
                      id="add-model-length"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddNewModel}
                className="btn-secondary"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', height: '32px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', background: '#000', color: '#fff', border: '1px solid #000', borderRadius: '8px' }}
                id="save-model-btn"
              >
                <LucidePlus size={14} /> Add Model to Registry
              </button>

              {customModels.length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                    Custom Models Loaded ({customModels.length})
                  </span>
                  <div style={{ maxHeight: '90px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '2px' }}>
                    {customModels.map((cm, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.68rem', color: '#1e293b' }}>
                        <div style={{ fontWeight: 600 }}>
                          <span style={{ color: '#2563eb', fontWeight: 800 }}>{cm.model}</span> (Size {cm.size})
                          <div style={{ fontSize: '0.6rem', color: '#64748b' }}>H:{cm.height} × W:{cm.width} × L:{cm.length} mm</div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveCustomModel(cm.model, cm.size)} 
                          style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', padding: '4px', fontWeight: 'bold' }}
                          title="Delete Model"
                          id={`delete-custom-model-${cm.model}-${cm.size}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ margin: 0, fontSize: '0.65rem', fontWeight: 950, color: '#000', textTransform: 'uppercase' }}>Fleet Setup</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={undo} disabled={historyIndex <= 0} className="btn-secondary" title="Undo (Ctrl+Z)"><LucideUndo size={14} /></button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} className="btn-secondary" title="Redo (Ctrl+Y)"><LucideRedo size={14} /></button>
              <button onClick={addContainer} className="btn-secondary"><LucidePlus size={14} /> Add Unit</button>
            </div>
          </div>
          {containers.map((c, ci) => (
            <div key={c.id} className="container-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="badge">#{ci + 1}</span>
                  <select className="select-sm" value={c.type} onChange={e => setContainers(containers.map(x => x.id === c.id ? { ...x, type: e.target.value as any } : x))}>
                    {Object.entries(CONTAINER_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => toggleNet(c.id)} className={`btn-icon ${c.hasNet ? 'active' : ''}`} title="Toggle Cargo Net"><LucideNet size={14} /></button>
                  <button onClick={() => removeContainer(c.id)} className="btn-icon-danger"><LucideTrash2 size={14} /></button>
                </div>
              </div>
              {c.items.map((item, idx) => (
                <div key={item.id} className="cargo-row">
                  <div className="reorder-controls">
                    <button onClick={() => moveCargoItem(c.id, idx, 'up')} disabled={idx === 0} className="reorder-btn"><LucideChevronUp size={12} /></button>
                    <button onClick={() => moveCargoItem(c.id, idx, 'down')} disabled={idx === c.items.length - 1} className="reorder-btn"><LucideChevronDown size={12} /></button>
                  </div>
                  <div className="input-field"><label>Model</label>
                    <select value={item.model} onChange={e => updateCargoItem(c.id, item.id, { model: e.target.value, size: '' })}>
                      {uniqueModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="input-field"><label>Size</label>
                    <select value={item.size} onChange={e => updateCargoItem(c.id, item.id, { size: e.target.value })}>
                      <option value="">--</option>
                      {modelLibrary.filter(m => m.model === item.model).map(m => <option key={m.size} value={m.size}>{m.size}"</option>)}
                    </select>
                  </div>
                  <div className="input-field" style={{ width: '45px' }}><label>Qty</label><input type="number" min="1" value={item.qty} onChange={e => updateCargoItem(c.id, item.id, { qty: parseInt(e.target.value) || 1 })} /></div>
                  <div className="input-field" style={{ width: '25px' }}><label><LucidePalette size={10} /></label><input type="color" value={item.color} className="color-input" onChange={e => updateCargoItem(c.id, item.id, { color: e.target.value })} /></div>
                  <button onClick={() => removeCargoItem(c.id, item.id)} className="btn-icon-danger" style={{ marginTop: '14px' }}><LucideTrash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => addCargoItem(c.id)} className="btn-ghost-full"><LucidePlus size={14} /> New Cargo Row</button>
            </div>
          ))}
        </div>

        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '12px', 
          padding: '12px 14px', 
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }} id="box-stacking-direction-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 950, color: '#000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Stacking Orientation Heuristic
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              onClick={() => setBoxSurfaceDirection('default')}
              style={{
                padding: '6px 10px',
                fontSize: '0.66rem',
                fontWeight: 800,
                borderRadius: '8px',
                cursor: 'pointer',
                border: boxSurfaceDirection === 'default' ? '1.5px solid #000' : '1px solid #cbd5e1',
                background: boxSurfaceDirection === 'default' ? '#000' : '#fff',
                color: boxSurfaceDirection === 'default' ? '#fff' : '#475569',
                transition: 'all 0.15s'
              }}
              title="Default stacking (wall-hugging / smallest side along container length)"
              id="heuristic-default-btn"
            >
              Default (Wall-Hugging)
            </button>
            <button
              onClick={() => setBoxSurfaceDirection('alternate')}
              style={{
                padding: '6px 10px',
                fontSize: '0.66rem',
                fontWeight: 800,
                borderRadius: '8px',
                cursor: 'pointer',
                border: boxSurfaceDirection === 'alternate' ? '1.5px solid #000' : '1px solid #cbd5e1',
                background: boxSurfaceDirection === 'alternate' ? '#000' : '#fff',
                color: boxSurfaceDirection === 'alternate' ? '#fff' : '#475569',
                transition: 'all 0.15s'
              }}
              title="Alternate face stacking (longest side along container length)"
              id="heuristic-alternate-btn"
            >
              Length-Wise
            </button>
            <button
              onClick={() => setBoxSurfaceDirection('height-max')}
              style={{
                padding: '6px 10px',
                fontSize: '0.66rem',
                fontWeight: 800,
                borderRadius: '8px',
                cursor: 'pointer',
                border: boxSurfaceDirection === 'height-max' ? '1.5px solid #000' : '1px solid #cbd5e1',
                background: boxSurfaceDirection === 'height-max' ? '#000' : '#fff',
                color: boxSurfaceDirection === 'height-max' ? '#fff' : '#475569',
                transition: 'all 0.15s'
              }}
              title="Upright stacking (tallest side standing vertical)"
              id="heuristic-height-max-btn"
            >
              Upright (Height-Max)
            </button>
            <button
              onClick={() => setBoxSurfaceDirection('height-min')}
              style={{
                padding: '6px 10px',
                fontSize: '0.66rem',
                fontWeight: 800,
                borderRadius: '8px',
                cursor: 'pointer',
                border: boxSurfaceDirection === 'height-min' ? '1.5px solid #000' : '1px solid #cbd5e1',
                background: boxSurfaceDirection === 'height-min' ? '#000' : '#fff',
                color: boxSurfaceDirection === 'height-min' ? '#fff' : '#475569',
                transition: 'all 0.15s'
              }}
              title="Flat stable stacking (smallest side vertical / low center of gravity)"
              id="heuristic-height-min-btn"
            >
              Flat Stable (Height-Min)
            </button>
          </div>
        </div>

        <button onClick={runPacking} disabled={isPacking} className="btn-primary">
          {isPacking ? <LucideRotateCw className="animate-spin" size={20} /> : <LucideMaximize size={20} />}
          {isPacking ? 'Solving Matrix...' : 'Apply Density Solver'}
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 20, display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => { setMode('auto'); setSelectedBoxId(null); }} 
            className={`mode-btn ${mode === 'auto' ? 'active' : ''}`}
            title="View Mode"
          >
            <LucidePointer size={20} />
          </button>
          <button 
            onClick={() => setMode('manual')} 
            className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
            title="Manual Adjust (Hand Mode)"
          >
            <LucideHand size={20} />
          </button>
          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }} />
          <button onClick={saveCheckpoint} className="mode-btn" title="Save Checkpoint"><LucideSave size={20} /></button>
          <button onClick={loadCheckpoint} disabled={!checkpoint} className="mode-btn" title="Restore Checkpoint"><LucideUndo size={20} /></button>
          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }} />
          <button onClick={undo} disabled={historyIndex <= 0} className="mode-btn" title="Undo (Ctrl+Z)"><LucideUndo size={20} /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="mode-btn" title="Redo (Ctrl+Y)"><LucideRedo size={20} /></button>
          {mode === 'manual' && (
            <>
              <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }} />
              <button 
                onClick={() => setAutoSettle(prev => !prev)} 
                className={`mode-btn ${autoSettle ? 'active' : ''}`} 
                title={`Auto-Settle & Gravity (G): ${autoSettle ? 'ON' : 'OFF'}`}
                style={autoSettle ? { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' } : {}}
              >
                <LucideSparkles size={20} />
              </button>
              <button 
                onClick={tidyAllContainers} 
                className="mode-btn" 
                title="Tidy Cargo Gaps neatly"
                style={{ background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px', border: '1px solid #0f172a', borderRadius: '12px', height: '40px' }}
              >
                <LucideSparkles size={16} />
                <span style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>Tidy Gaps</span>
              </button>

              {selectedBoxIds.length > 0 && (
                <>
                  <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }} />
                  <button 
                    onClick={() => setTransformMode(prev => prev === 'translate' ? 'rotate' : 'translate')} 
                    className={`mode-btn ${transformMode === 'rotate' ? 'active' : ''}`} 
                    title="Toggle Translate/Rotate (R)"
                  >
                    <LucideRotateCw size={20} />
                  </button>
                  <button onClick={rotateSelectedBox} className="mode-btn" title="Auto-Rotate (T)"><LucideCompass size={20} /></button>
                  <button onClick={() => rotateSelectedBoxAxis('X')} className="mode-btn" style={{ fontWeight: 800, fontSize: '0.8rem', fontFamily: 'monospace' }} title="Pitch X (90° Height ↔ Depth)">X</button>
                  <button onClick={() => rotateSelectedBoxAxis('Y')} className="mode-btn" style={{ fontWeight: 800, fontSize: '0.8rem', fontFamily: 'monospace' }} title="Yaw Y (90° Width ↔ Depth)">Y</button>
                  <button onClick={() => rotateSelectedBoxAxis('Z')} className="mode-btn" style={{ fontWeight: 800, fontSize: '0.8rem', fontFamily: 'monospace' }} title="Roll Z (90° Width ↔ Height)">Z</button>
                  <button onClick={settleSelectedBox} className="mode-btn" title="Snap Settle Box"><LucideLayers size={20} /></button>
                  <button onClick={deleteSelectedBox} className="mode-btn-danger" title="Delete (Del)"><LucideTrash2 size={20} /></button>
                  <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }} />
                  <button onClick={copySelectedBoxes} className="mode-btn" title="Copy (Ctrl+C)" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <LucideCopy size={20} />
                  </button>
                </>
              )}
              {copiedBoxes.length > 0 && (
                <button onClick={pasteCopiedBoxes} className="mode-btn" title="Paste (Ctrl+V)" style={{ background: '#22c55e', color: '#fff', border: '1px solid #22c55e' }}>
                  <LucideClipboard size={20} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Floating View & Render Options Panel */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* CAMERA ANGLES options */}
          <div style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px 16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '8px', width: '280px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 950, color: '#000', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Camera Angles</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              <button onClick={() => setCameraAngle('iso')} className="btn-camera" title="Isometric View">ISO</button>
              <button onClick={() => setCameraAngle('rear')} className="btn-camera" title="Rear Door View">REAR</button>
              <button onClick={() => setCameraAngle('front')} className="btn-camera" title="Tractor Cabin View">CABIN</button>
              <button onClick={() => setCameraAngle('side')} className="btn-camera" title="Side Profile">SIDE</button>
              <button onClick={() => setCameraAngle('top')} className="btn-camera" title="Top-Down Ortho">TOP</button>
            </div>
          </div>

          {/* RENDER TOGGLES */}
          <div style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px 16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px', width: '280px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 950, color: '#000', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Render Options</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', color: '#1e293b' }}>
                <input type="checkbox" checked={renderOptions.showCabin} onChange={e => setRenderOptions(prev => ({ ...prev, showCabin: e.target.checked }))} style={{ accentColor: '#000', width: '14px', height: '14px', cursor: 'pointer' }} />
                Show cabin Tractor
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', color: '#1e293b' }}>
                <input type="checkbox" checked={renderOptions.showNet} onChange={e => setRenderOptions(prev => ({ ...prev, showNet: e.target.checked }))} style={{ accentColor: '#000', width: '14px', height: '14px', cursor: 'pointer' }} />
                Elastic Net (Cargo Net)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', color: '#1e293b' }}>
                <input type="checkbox" checked={renderOptions.showTruck} onChange={e => setRenderOptions(prev => ({ ...prev, showTruck: e.target.checked }))} style={{ accentColor: '#000', width: '14px', height: '14px', cursor: 'pointer' }} />
                Show truck (Chassis & Wheels)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', color: '#1e293b' }}>
                <input type="checkbox" checked={renderOptions.showLabels} onChange={e => setRenderOptions(prev => ({ ...prev, showLabels: e.target.checked }))} style={{ accentColor: '#000', width: '14px', height: '14px', cursor: 'pointer' }} id="toggle-labels-checkbox" />
                Show Box Model Labels
              </label>
            </div>
          </div>
        </div>

        <Canvas shadows gl={{ antialias: true }} onPointerMissed={() => setSelectedBoxId(null)}>
          <color attach="background" args={['#f8fafc']} />
          <PerspectiveCamera makeDefault position={[25, 20, 25]} fov={22} />
          <OrbitControls ref={orbitRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.05} enabled={!selectedBoxId} keyEvents={true} />
          <ambientLight intensity={3.5} />
          <directionalLight position={[40, 80, 40]} intensity={1.5} castShadow />
          <pointLight position={[-50, 40, -50]} intensity={0.5} color="#dbeafe" />
          <Grid infiniteGrid cellSize={1} sectionSize={5} sectionColor="#cbd5e1" cellColor="#e2e8f0" fadeDistance={250} />
          <group>
            {results.map((result, idx) => {
              let cumulativeStart = 0;
              for (let i = 0; i < idx; i++) {
                cumulativeStart += results[i].packedBoxes.length;
              }
              return (
                <Container3D 
                  key={result.containerId} 
                  result={result} 
                  offset={[0, 0, idx * 18]} 
                  selectedBoxIds={selectedBoxIds}
                  onSelectBox={handleSelectBox}
                  isManualMode={mode === 'manual'}
                  transformMode={transformMode}
                  onUpdateBox={onUpdateBox}
                  renderOptions={renderOptions}
                  timelineStep={timelineStep}
                  cumulativeStart={cumulativeStart}
                  autoSettle={autoSettle}
                />
              );
            })}
          </group>
        </Canvas>

        {/* Stuffing Sequence Timeline Widget */}
        {results.length > 0 && totalPackedBoxes > 0 && (
          <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '400px', zIndex: 20, background: 'rgba(255, 255, 255, 0.98)', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '16px 20px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge" style={{ background: '#000', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem' }}>STUFFING SEQUENCE</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 850, color: '#101827' }}>
                  {timelineStep === null ? 'All Cargo Packed (Viewing Complete Trailer)' : `Loading Sequence: Step ${timelineStep} of ${totalPackedBoxes}`}
                </span>
              </div>
              
              {timelineStep !== null && timelineStep > 0 && (
                <div style={{ fontSize: '0.72rem', color: '#4b5563', fontWeight: 800, background: '#f3f4f6', padding: '4.5px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  Current Loaded: <span style={{ color: '#2563eb' }}>{getCurrentBoxInfo(timelineStep - 1)}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => setTimelineStep(0)} 
                  className="btn-timeline-control" 
                  title="Reset Packing"
                >
                  ⏮
                </button>
                <button 
                  onClick={() => setTimelineStep(prev => prev === null ? totalPackedBoxes - 1 : Math.max(0, prev - 1))} 
                  className="btn-timeline-control" 
                  title="Previous Step"
                >
                  ◀
                </button>
                <button 
                  onClick={() => setIsPlayingTimeline(prev => !prev)} 
                  className="btn-timeline-control" 
                  style={{ background: isPlayingTimeline ? '#dc2626' : '#10b981', color: '#fff', minWidth: '95px', fontWeight: 'bold' }}
                  title={isPlayingTimeline ? 'Pause Auto Load' : 'Auto Load Step-by-Step'}
                >
                  {isPlayingTimeline ? '⏸ PAUSE' : '▶ AUTO PACK'}
                </button>
                <button 
                  onClick={() => setTimelineStep(prev => prev === null ? null : (prev >= totalPackedBoxes ? null : prev + 1))} 
                  className="btn-timeline-control" 
                  title="Next Step"
                >
                  ▶
                </button>
                <button 
                  onClick={() => { setTimelineStep(null); setIsPlayingTimeline(false); }} 
                  className="btn-timeline-control" 
                  title="Show Solid Packing"
                >
                  ★ FULL VIEW
                </button>
              </div>

              <input 
                type="range" 
                min="0" 
                max={totalPackedBoxes} 
                value={timelineStep === null ? totalPackedBoxes : timelineStep} 
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setTimelineStep(val === totalPackedBoxes ? null : val);
                }}
                style={{ flex: 1, accentColor: '#000', cursor: 'pointer', height: '6px', borderRadius: '3px' }}
              />
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="analytic-overlay">
            <h3 className="overlay-title"><LucideSettings2 size={14} style={{ marginRight: '8px' }} />Logistics Report</h3>
            {results.map(r => {
              const density = (r.packedVolume / r.totalVolume) * 100;
              const wastedPercent = 100 - density;
              return (
                <div key={r.containerId} className="result-stat">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <LucideCheckCircle size={14} color="#10b981" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 950, color: '#000' }}>{r.containerType} UNIT</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 950, color: '#10b981' }}>{density.toFixed(1)}% Dense</span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 950, color: '#ef4444' }}>{wastedPercent.toFixed(1)}% Wasted</span>
                    </div>
                  </div>
                  
                  {/* Progress bar split display */}
                  <div className="progress-bar" style={{ display: 'flex' }}>
                    <div className="progress-fill" style={{ width: `${density}%`, background: '#000' }} />
                    <div className="progress-wasted" style={{ width: `${wastedPercent}%`, background: '#fee2e2' }} />
                  </div>

                  {/* Volume breakdowns in cubic meters */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: '#475569', fontWeight: 800, marginTop: '4px', marginBottom: '10px' }}>
                    <span>Packed Vol: {(r.packedVolume / 1e9).toFixed(2)} m³ / {(r.totalVolume / 1e9).toFixed(2)} m³</span>
                    <span style={{ color: '#ef4444' }}>Wasted: {((r.totalVolume - r.packedVolume) / 1e9).toFixed(2)} m³</span>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-pill">Units: <strong>{r.packedBoxes.length}</strong></div>
                    <div className="stat-pill"><LucideLayers size={10} /> Tier Mode</div>
                  </div>

                  {r.unfitItems.length > 0 && (
                    <div className="unfit-list">
                      <div className="unfit-header"><LucideAlertTriangle size={14} /><span>Surplus Inventory:</span></div>
                      {r.unfitItems.map((u, i) => <div key={i} className="unfit-item">• {u.model} {u.size}": {u.count} unfit</div>)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Export and Clipboard Actions */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {exportSuccessMessage && (
                <div style={{ 
                  background: '#f0fdf4', 
                  border: '1px solid #bbf7d0', 
                  color: '#16a34a', 
                  padding: '8px 12px', 
                  borderRadius: '10px', 
                  fontSize: '0.72rem', 
                  fontWeight: 800, 
                  textAlign: 'center' 
                }}>
                  {exportSuccessMessage}
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button 
                  onClick={handleCopyToClipboard} 
                  className="btn-secondary" 
                  style={{ justifyContent: 'center', padding: '8px 10px', fontSize: '0.7rem' }}
                  title="Copy packing summary text to clipboard"
                >
                  <LucideCopy size={12} /> Copy Report
                </button>
                <button 
                  onClick={handleExportReport} 
                  className="btn-secondary" 
                  style={{ justifyContent: 'center', padding: '8px 10px', fontSize: '0.7rem' }}
                  title="Generate a print-ready PDF logistics report"
                >
                  <LucideDownload size={12} /> Export Report (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .btn-camera { background: #f1f5f9; border: 1px solid #cbd5e1; color: #1e293b; padding: 6px 4px; border-radius: 8px; font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: all 0.2s; text-align: center; }
        .btn-camera:hover { background: #000; color: #fff; border-color: #000; }
        .btn-timeline-control { background: #f1f5f9; border: 1px solid #cbd5e1; color: #1e293b; padding: 6px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; gap: 4px; }
        .btn-timeline-control:hover { background: #e2e8f0; transform: scale(1.04); }
        .mode-btn { background: #fff; border: 1px solid #e2e8f0; color: #64748b; padding: 12px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .mode-btn.active { background: #000; color: #fff; border-color: #000; }
        .mode-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .mode-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .mode-btn-danger { background: #fff; border: 1px solid #fee2e2; color: #ef4444; padding: 12px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .mode-btn-danger:hover { background: #ef4444; color: #fff; transform: translateY(-2px); }
        .btn-icon { background: transparent; border: 1px solid #e2e8f0; color: #cbd5e1; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s; }
        .btn-icon.active { background: #ef4444; color: #fff; border-color: #ef4444; }
        .section-config { background: #f1f5f9; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0; }
        .container-card { background: #f8fafc; padding: 14px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .cargo-row { display: grid; grid-template-columns: 24px 1fr 1fr 45px 25px 24px; gap: 6px; margin-bottom: 10px; align-items: center; }
        .reorder-controls { display: flex; flex-direction: column; gap: 1px; margin-top: 14px; }
        .reorder-btn { background: #fff; border: 1px solid #e2e8f0; color: #000; padding: 1px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .reorder-btn:disabled { opacity: 0.1; cursor: not-allowed; }
        .input-field { display: flex; flex-direction: column; gap: 3px; }
        .input-field label { font-size: 0.45rem; font-weight: 950; color: #000; text-transform: uppercase; letter-spacing: 0.08em; }
        .input-field select, .input-field input { padding: 4px 6px; border-radius: 5px; border: 1px solid #cbd5e1; font-size: 0.7rem; background: #fff; font-weight: 800; outline: none; color: #000; }
        .color-input { padding: 1px !important; height: 24px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 3px; }
        .badge { font-size: 0.55rem; font-weight: 950; color: #000; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; }
        .btn-primary { padding: 16px; border-radius: 12px; border: none; background: #000; color: #fff; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2); }
        .btn-secondary { padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #000; font-size: 0.65rem; font-weight: 950; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .btn-ghost-full { width: 100%; padding: 8px; border-radius: 8px; border: 1.5px dashed #e2e8f0; background: transparent; color: #000; font-size: 0.68rem; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-icon-danger { background: transparent; border: none; color: #cbd5e1; cursor: pointer; padding: 4px; }
        .btn-icon-danger:hover { color: #ef4444; }
        .analytic-overlay { position: absolute; bottom: 24px; right: 24px; background: rgba(255, 255, 255, 0.98); padding: 24px; border-radius: 20px; backdrop-filter: blur(20px); border: 1px solid #e2e8f0; box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1); width: 350px; max-height: 80vh; overflow-y: auto; }
        .overlay-title { margin: 0 0 16px 0; font-size: 0.7rem; font-weight: 950; color: #000; text-transform: uppercase; letter-spacing: 0.12em; display: flex; align-items: center; }
        .result-stat { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
        .progress-bar { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; margin: 10px 0; border: 1px solid #e2e8f0; }
        .progress-fill { height: 100%; background: #000; transition: width 1.2s ease-out; }
        .stats-grid { display: flex; gap: 8px; margin-top: 12px; }
        .stat-pill { background: #f8fafc; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; color: #000; font-weight: 800; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 4px; }
        .stat-pill strong { color: #000; }
        .unfit-list { margin-top: 14px; background: #fef2f2; padding: 10px; border-radius: 10px; font-size: 0.7rem; color: #b91c1c; border: 1px solid #fee2e2; }
        .unfit-header { display: flex; gap: 6px; align-items: center; font-weight: 950; text-transform: uppercase; margin-bottom: 6px; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
