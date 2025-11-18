import React from "react";
import LessonForm from "../../components/forms/LessonForm";

/**
 * PUBLIC_INTERFACE
 * LessonsAuthoringPage
 * Wrapper page for lesson authoring. Renders a simple create-new form.
 * Note: This avoids self-referential exports or barrel indirection to prevent circular import loops.
 */
export default function LessonsAuthoringPage() {
  // For now, provide a minimal authoring experience: a single create form.
  // In a fuller implementation, this can list lessons for a selected course and support edit/delete.
  const [initial] = React.useState({});

  const handleSubmit = async (form) => {
    // TODO: integrate with lessonsService.upsertLesson(form)
    // This is a safe placeholder to avoid runtime loops; keeps route mountable.
    // eslint-disable-next-line no-alert
    alert("Submitting lesson (placeholder). Title: " + (form?.title || ""));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Lessons Authoring</h1>
      <div className="text-sm text-gray-600">
        Minimal placeholder to avoid circular import. Implement full CRUD as needed.
      </div>
      <LessonForm initial={initial} onSubmit={handleSubmit} submitting={false} />
    </div>
  );
}
