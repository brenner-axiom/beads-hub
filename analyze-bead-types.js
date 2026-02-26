#!/usr/bin/env node

// This file analyzes how bead types are classified in the beads-hub system
// Based on the task, Romanov's pull mechanism incorrectly classifies research beads as ops tasks

const fs = require('fs');
const path = require('path');

// Function to examine how beads are classified
function analyzeBeadClassification() {
  console.log("Analyzing bead type classification in beads-hub...");
  
  // Check the current repository structure
  const repoPath = '/home/ubuntu/.openclaw/workspaces/beads-hub';
  
  // Check if there's any existing logic for classification
  const files = [];
  try {
    const walk = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else {
          files.push(fullPath);
        }
      });
    };
    walk(repoPath);
  } catch (error) {
    console.error('Error walking repository:', error.message);
  }

  // Look for pattern matching logic or classification scripts
  const classificationScripts = files.filter(file => 
    file.includes('classify') || 
    file.includes('type') || 
    file.includes('research') || 
    file.includes('ops') ||
    file.includes('pull')
  );

  console.log("\nPotential classification scripts found:");
  classificationScripts.forEach(script => {
    console.log(` - ${script}`);
  });

  // Show sample bead data
  console.log("\nSample beads in the system:");
  
  // Since we can't run bd commands here directly, we'll describe what we 
  // expect the classification logic to be based on the problem description
  
  console.log("Based on the issue description, Romanov's mechanism is misclassifying:");
  console.log("- EU AI Act documentation");
  console.log("- knowledge archive evaluation");
  console.log("as operations tasks instead of research tasks.");
  
  console.log("\nThe issue is likely in how the system defines what constitutes a 'research' task vs 'ops' task");
  console.log("This probably involves regex pattern matching or keywords that determine bead classification.");
  
  return classificationScripts;
}

// Run the analysis
analyzeBeadClassification();