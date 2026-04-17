import {create} from 'zustand';

const useOrgStore = create((set, get) => ({
    orgs: [],
    currentOrg: null,

    setOrgs: (orgs) => {
        set({orgs});
        if(orgs.length > 0 && !get().currentOrg) {
            set({currentOrg: orgs[0]});
        }
    },

    setCurrentOrg: (org) => {
        set({currentOrg: org});
    },

    addOrg: (org) => {
        set((state) => ({
            orgs: [...state.orgs, org],
            currentOrg: org,
        }));
    },

    clearOrgs: () => {
        set({orgs: [], currentOrg: null});
    },
}));

export default useOrgStore;