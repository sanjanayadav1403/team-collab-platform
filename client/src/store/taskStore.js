import { create } from 'zustand';

const useTaskStore = create((set) => ({
  projects: [],
  selectedProject: null,
  tasks: [],
  groupedTasks: {},
  statuses: [],
  myTasks: [],
  loading: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project, tasks: [], groupedTasks: {} }),
  setTasks: (tasks, grouped) => set({ tasks, groupedTasks: grouped }),
  setStatuses: (statuses) => set({ statuses }),
  setMyTasks: (myTasks) => set({ myTasks }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearTasks: () => set({ tasks: [], groupedTasks: {}, selectedProject: null }),
}));

export default useTaskStore;