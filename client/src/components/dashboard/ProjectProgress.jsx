const ProjectProgress = ({ projects }) => {
    return (
        <div className="bg-gray-300 border border-gray-200 rounded-2xl p-5">
            <div className="mb-5">
                <h3 className="text-gray-800 font-semibold">Project Completion</h3>
                <p className="text-gray-600 text-xs mt-0.5">{projects.length} active projects</p>
            </div>

            {projects.length === 0 ? (
                <p className="text">No Projects found</p>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div key={project.id}>
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-sm text-gray-700 truncate flex-1 mr-2" title={project.name}>
                                    {project.name}
                                </p>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-gray-500">
                                        {project.done}/{project.total}
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 bg-gray-400 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${project.percentage >= 75 ? 'bg-green-500' :
                                            project.percentage >= 40 ? 'bg-yellow-500' :
                                                'bg-indigo-500'
                                        }`}
                                    style={{ width: `${project.percentage}%` }}
                                />
                            </div>

                            {/* Mini stats */}
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-blue-400">
                                    {project.inProgress} in progress
                                </span>
                                <span className="text-xs text-gray-600">·</span>
                                <span className="text-xs text-gray-600">
                                    {project.total - project.done - project.inProgress} remaining
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectProgress;