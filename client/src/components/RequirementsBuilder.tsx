import { useState } from 'react';
import type { RequirementCategory, RequirementType } from '../types';
import coursesData from '../../../server/data/courses.json';

interface RequirementsBuilderProps {
  categories: RequirementCategory[];
  onChange: (categories: RequirementCategory[]) => void;
}

const TYPE_OPTIONS: {
  value: RequirementType;
  label: string;
  description: string;
}[] = [
  {
    value: 'required',
    label: 'Required Courses',
    description: 'Specific courses that must all be completed',
  },
  {
    value: 'pick_n',
    label: 'Pick N from List',
    description: 'Student picks N courses from a defined list',
  },
  {
    value: 'max_level',
    label: 'Max Units at Level',
    description: 'Maximum units allowed at or below a course level',
  },
  {
    value: 'max_department',
    label: 'Max Units from Department',
    description: 'Maximum units allowed from one department',
  }
];

const EMPTY_FORM: RequirementCategory = {
  label: '',
  type: 'required',
  requiredCourses: [],
  minUnits: 3
};

// ─── Course Tag Input ────────────────────────────────────────────
function CourseTagInput({
  courses,
  onChange,
  placeholder
}: {
  courses: string[];
  onChange: (courses: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const add = () => {
    const code = input.trim().toUpperCase();
    if (!code) return;
    const exists = (coursesData as any[]).some(c => c.code === code);
    if (!exists) { setError(`"${code}" not found`); return; }
    if (courses.includes(code)) { setError(`"${code}" already added`); return; }
    onChange([...courses, code]);
    setInput('');
    setError('');
  };

  return (
    <div>
      <div className="flex gap-2 mb-1">
        <input
          className="flex-1 border rounded-lg p-2 text-sm uppercase"
          placeholder={placeholder}
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button
          onClick={add}
          className="bg-green-600 text-white px-3 rounded-lg text-sm hover:bg-green-700 transition"
        >Add</button>
      </div>
      {error && <p className="text-xs text-red-500 mb-1">⚠️ {error}</p>}
      <div className="flex flex-wrap gap-1 mt-1">
        {courses.map(code => (
          <span key={code} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            {code}
            <button onClick={() => onChange(courses.filter(c => c !== code))} className="hover:text-red-500 ml-1">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Requirement Form (inline drop-down) ────────────────────────
function RequirementForm({
  initial,
  onSubmit,
  onCancel
}: {
  initial?: RequirementCategory;
  onSubmit: (cat: RequirementCategory) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<RequirementCategory>(initial || EMPTY_FORM);
  const [error, setError] = useState('');

  const update = (fields: Partial<RequirementCategory>) =>
    setForm(prev => ({ ...prev, ...fields }));

  const handleSubmit = () => {
    if (!form.label.trim()) { setError('Please enter a category name'); return; }
    if (form.type === 'required' && form.requiredCourses.length === 0) {
      setError('Please add at least one required course'); return;
    }
    if (form.type === 'pick_n' && (!form.pickFromList || form.pickFromList.length === 0)) {
      setError('Please add courses to pick from'); return;
    }
    if (form.type === 'max_level' && !form.maxLevel) {
      setError('Please enter a max level'); return;
    }
    if (form.type === 'max_department' && !form.maxDepartment) {
      setError('Please enter a department code'); return;
    }
    onSubmit(form);
  };

  const renderFields = () => {
    switch (form.type) {
      case 'required':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Required Courses</label>
              <CourseTagInput
                courses={form.requiredCourses}
                onChange={courses => update({ requiredCourses: courses })}
                placeholder="e.g. CMPUT 114"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Minimum Units</label>
              <input
                type="number"
                className="w-24 border rounded-lg p-2 text-sm"
                value={form.minUnits}
                onChange={e => update({ minUnits: Number(e.target.value) })}
              />
            </div>
          </div>
        );

      case 'pick_n':
        return (
          <div className="space-y-3">
            <div className="flex gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Pick how many?</label>
                <input
                  type="number" min={1}
                  className="w-24 border rounded-lg p-2 text-sm"
                  value={form.pickN || 1}
                  onChange={e => update({ pickN: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Minimum Units</label>
                <input
                  type="number"
                  className="w-24 border rounded-lg p-2 text-sm"
                  value={form.minUnits}
                  onChange={e => update({ minUnits: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Pick from these courses</label>
              <CourseTagInput
                courses={form.pickFromList || []}
                onChange={list => update({ pickFromList: list })}
                placeholder="e.g. BIOL 107"
              />
            </div>
          </div>
        );

      case 'max_level':
        return (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
              ℹ️ Limits how many units a student can take at or below a certain level. Example: max 48 units of 100-level courses.
            </div>
            <div className="flex gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Max Level (e.g. 199 for 100-level)</label>
                <input
                  type="number"
                  className="w-32 border rounded-lg p-2 text-sm"
                  placeholder="199"
                  value={form.maxLevel || ''}
                  onChange={e => update({ maxLevel: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Maximum Units Allowed</label>
                <input
                  type="number"
                  className="w-32 border rounded-lg p-2 text-sm"
                  placeholder="48"
                  value={form.maxUnits || ''}
                  onChange={e => update({ maxUnits: Number(e.target.value), minUnits: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        );

      case 'max_department':
        return (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
              ℹ️ Limits how many units a student can take from one department. Example: max 60 units of CMPUT courses.
            </div>
            <div className="flex gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Department Code</label>
                <input
                  type="text"
                  className="w-32 border rounded-lg p-2 text-sm uppercase"
                  placeholder="CMPUT"
                  value={form.maxDepartment || ''}
                  onChange={e => update({ maxDepartment: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Maximum Units Allowed</label>
                <input
                  type="number"
                  className="w-32 border rounded-lg p-2 text-sm"
                  placeholder="60"
                  value={form.maxUnits || ''}
                  onChange={e => update({ maxUnits: Number(e.target.value), minUnits: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="border-2 border-green-400 rounded-xl p-4 bg-green-50 space-y-4">
      {/* Category name */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Category Name *</label>
        <input
          className="w-full border rounded-lg p-2 text-sm"
          placeholder="e.g. Core CS, Natural Science Electives..."
          value={form.label}
          onChange={e => { update({ label: e.target.value }); setError(''); }}
        />
      </div>

      {/* Type selector */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">Requirement Type *</label>
        <div className="grid grid-cols-2 gap-2">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => update({ type: opt.value })}
              className={`p-3 rounded-xl border-2 text-left transition
                ${form.type === opt.value
                  ? 'border-green-600 bg-white'
                  : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className="text-xs font-semibold text-gray-800">{opt.label}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-tight">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic fields */}
      <div className="pt-2 border-t border-green-200">
        {renderFields()}
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-500">⚠️ {error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
        >
          Add Requirement ✓
        </button>
      </div>
    </div>
  );
}

// ─── Submitted Card ──────────────────────────────────────────────
function SubmittedCard({
  category,
  onEdit,
  onRemove
}: {
  category: RequirementCategory;
  onEdit: () => void;
  onRemove: () => void;
}) {

  const getSummary = () => {
    switch (category.type) {
      case 'required':
        return `${category.requiredCourses.length} required courses · ${category.minUnits} units`;
      case 'pick_n':
        return `Pick ${category.pickN} from ${category.pickFromList?.length || 0} courses · ${category.minUnits} units`;
      case 'max_level':
        return `Max ${category.maxUnits} units at ${category.maxLevel}-level`;
      case 'max_department':
        return `Max ${category.maxUnits} units from ${category.maxDepartment}`;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{category.label}</p>
          <p className="text-xs text-gray-400">{getSummary()}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="text-xs text-blue-500 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition"
        >✏️ Edit</button>
        <button
          onClick={onRemove}
          className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition"
        >🗑</button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function RequirementsBuilder({
  categories,
  onChange
}: RequirementsBuilderProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = (cat: RequirementCategory) => {
    onChange([...categories, cat]);
    setShowForm(false);
  };

  const handleEdit = (index: number, cat: RequirementCategory) => {
    const updated = [...categories];
    updated[index] = cat;
    onChange(updated);
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    onChange(categories.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Submitted cards */}
      {categories.map((cat, i) => (
        editingIndex === i ? (
          <RequirementForm
            key={i}
            initial={cat}
            onSubmit={updated => handleEdit(i, updated)}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <SubmittedCard
            key={i}
            category={cat}
            onEdit={() => {
              setShowForm(false);
              setEditingIndex(i);
            }}
            onRemove={() => handleRemove(i)}
          />
        )
      ))}

      {/* Add form */}
      {showForm ? (
        <RequirementForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingIndex(null);
          }}
          className="w-full py-3 border-2 border-dashed border-green-400 text-green-600 rounded-xl font-semibold text-sm hover:bg-green-50 transition flex items-center justify-center gap-2"
        >
          + Add Requirement Category
        </button>
      )}
    </div>
  );
}