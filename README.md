# Quantum Interaction Visualizer

An interactive browser-based visualizer for exploring single-qubit and two-qubit quantum states.

I built this project to make some of the mathematics behind quantum computing easier to see. Instead of only reading state vectors and probabilities, you can apply gates, move through different states, and watch the corresponding visualizations update in real time.

## Live site

[Open the Quantum Interaction Visualizer](https://a4bray.github.io/WatQ-Visualizer/)

## Features

### Single-qubit mode

- Interactive Bloch sphere
- Theta and phi controls
- Smooth state-vector and slider transitions
- X, Y, Z, and Hadamard gates
- Live probability and state-vector calculations
- Measurement and state preparation
- Rotatable three-dimensional view with controlled zoom

### Two-qubit mode

- Individual X and Hadamard gates for each qubit
- CNOT operation
- Bell-state preparation
- Joint probabilities for 01, 10, 00, 11
- Reduced Bloch spheres for both qubits
- Correlation and concurrence calculations
- Visual indication of entanglement strength
- Global two-qubit Q-sphere showing probability and relative phase
- Two-qubit measurement and state preparation

## How to use it

Choose either the single-qubit or two-qubit mode from the opening screen.

In single-qubit mode, use the sliders to adjust the state directly or apply a quantum gate to see how the state vector, probabilities, and Bloch sphere change. The sphere can be rotated with the mouse, and **Reset View** returns it to the default camera position.

In two-qubit mode, apply gates to either qubit, create a Bell state, or measure both qubits. The probability bars, reduced Bloch spheres, Q-sphere, correlation values, and entanglement display update with the state.

## Running locally

Clone the repository:

```bash
git clone https://github.com/A4Bray/WatQ-Visualizer.git
cd WatQ-Visualizer
```

You can open `index.html` directly, although running a small local server is more reliable:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Built with

- HTML
- CSS
- JavaScript
- [Three.js](https://threejs.org/)

The project has no build step or framework. Three.js and OrbitControls are loaded from a CDN.

## Project structure

```text
WatQ-Visualizer/
index.html
styles.css
script.js
WATQ_logo_transparent.png
```

## Purpose

This is an educational visualizer rather than a full quantum-circuit simulator. Its focus is on presenting the relationship between quantum states, probabilities, phase, measurement, and entanglement in a clear visual form.

## Developer

Developed by **Andrew Bray**.
