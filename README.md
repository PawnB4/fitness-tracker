# Fitness Tracker

A modern mobile fitness tracking application built with React Native and Expo, designed to help users track their workouts, create workout plans, and monitor their fitness progress.

## Features

- **Workout Management**: Create, edit, and log workouts
- **Exercise Library**: Browse and add exercises to your workouts
- **Workout Plans**: Create custom workout plans with predefined exercises
- **Progress Tracking**: Monitor your fitness journey over time
- **Offline Support**: All data is stored locally using SQLite

## Technology Stack

- **Frontend**: React Native, Expo, Expo Router
- **UI Framework**: NativeWind (Tailwind CSS for React Native)
- **Database**: SQLite with Drizzle ORM
- **State Management**: Tanstack Query
- **Form Validation**: Zod, Tanstack React Form

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- iOS/Android Simulator or physical device


## Project Structure

- `/app`: Main application code and screens
  - `/(tabs)`: Main tab navigation screens
  - `/workout`: Workout creation and editing
  - `/workout-plan`: Workout plan management
- `/components`: Reusable UI components
- `/db`: Database configuration and schema
- `/lib`: Utility functions and hooks
- `/assets`: Images, fonts, and other static assets

## Database Schema

The app uses SQLite with Drizzle ORM and includes the following main tables:

- **exercises**: Definition of available exercises
- **workouts**: Logged workout sessions
- **workout_exercises**: Junction table linking exercises to specific workouts
- **workout_plans**: Custom workout plan templates
- **workout_plan_exercises**: Exercises included in workout plans

## Development

### Debugging

The app includes Drizzle Studio integration for database inspection during development.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
