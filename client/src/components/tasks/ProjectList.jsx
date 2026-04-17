const ProjectList = ({ projects, selectedProject, onSelect, loading }) => {
    if (loading) {
        return (
            <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Projects
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">from OpenProject</p>
            </div>

            <div>
                {projects.length === 0 ? (
                    <p>No projects found</p>
                ) : (
                    projects.map((project) => (
                        <button
                            key={project.id}
                            onClick={() => onSelect(project)}
                            className={`w-full text-left px-4 py-2.5 transition text-sm ${selectedProject?.id === project.id
                                ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500'
                                : 'text-gray-600 hover:bg-gray-800 hover:text-gray-200'
                                }`}
                        >
                            <p className="font-medium truncate">{project.name}</p>
                            {project.description && (
                                <p className="text-xs text-gray-600 truncate mt-0.5">
                                    {project.description.slice(0, 40)}
                                </p>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectList;