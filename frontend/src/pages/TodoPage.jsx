import { useEffect, useRef, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import TodoForm from '../components/todo/TodoForm';
import TodoItem from '../components/todo/TodoItem';
import { tasksRequest } from '../services/tasksApi';

export default function TodoPage() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [status, setStatus] = useState('');
  const [pendingAction, setPendingAction] = useState('');
  const [reload, setReload] = useState(0);
  const mounted = useRef(false);
  const actionInProgress = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    tasksRequest('', { signal: controller.signal })
      .then((savedTasks) => {
        if (controller.signal.aborted) return;
        setTasks(savedTasks);
        setHasLoaded(true);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reload]);

  // Wait for each database change before allowing another change.
  async function performAction(name, request, onSuccess) {
    if (actionInProgress.current || loading || !hasLoaded) return false;
    actionInProgress.current = true;
    setPendingAction(name);
    setActionError('');
    setStatus('');
    try {
      const result = await request();
      if (!mounted.current) return false;
      onSuccess(result);
      return true;
    } catch (error) {
      if (mounted.current) setActionError(error.message);
      return false;
    } finally {
      actionInProgress.current = false;
      if (mounted.current) setPendingAction('');
    }
  }

  function addTask(title) {
    return performAction('add', () => tasksRequest('', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }), (task) => {
      setTasks((previous) => [task, ...previous]);
      setStatus('Task added.');
    });
  }

  function toggleTask(id, completed) {
    return performAction(`toggle:${id}`, () => tasksRequest(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }), (savedTask) => {
      setTasks((previous) => previous.map((task) => task.id === id ? savedTask : task));
      setStatus(completed ? 'Task marked as completed.' : 'Task marked as active.');
    });
  }

  function deleteTask(id) {
    return performAction(`delete:${id}`, () => tasksRequest(`/${id}`, {
      method: 'DELETE',
    }), () => {
      setTasks((previous) => previous.filter((task) => task.id !== id));
      setStatus('Task deleted.');
    });
  }

  function retryLoading() {
    setLoadError('');
    setLoading(true);
    setReload((previous) => previous + 1);
  }

  const busy = Boolean(pendingAction);
  const completedCount = tasks.filter((task) => task.completed).length;
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <Card title="Focus Flow">
      <p className="mb-5 text-sm opacity-70">Keep track of your assignments and study tasks.</p>
      <TodoForm onAdd={addTask} disabled={loading || busy || !hasLoaded} adding={pendingAction === 'add'} />

      {loadError && (
        <div role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">
          <p>{loadError}</p>
          <Button type="button" variant="secondary" className="mt-2 border border-red-300" onClick={retryLoading} disabled={loading}>Retry</Button>
        </div>
      )}
      {actionError && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">{actionError}</p>}

      {loading ? <p role="status" className="py-6 text-center text-sm opacity-70">Loading tasks...</p> : hasLoaded && (
        <>
          <div className="my-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2" aria-label="Filter tasks">
              {['all', 'active', 'completed'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${filter === value ? 'bg-indigo-600 text-white' : 'border border-gray-300 bg-transparent'}`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-xs opacity-70">{tasks.length} total · {completedCount} completed</p>
          </div>

          <div aria-busy={busy}>
            {tasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm opacity-70">No tasks available. Add your first task above.</p>
            ) : filteredTasks.length === 0 ? (
              <p className="py-8 text-center text-sm opacity-70">No {filter} tasks available.</p>
            ) : (
              <ul className="mt-4 space-y-2" aria-label="Tasks">
                {filteredTasks.map((task) => (
                  <TodoItem key={task.id} todo={task} onToggle={toggleTask} onDelete={deleteTask} disabled={busy} deleting={pendingAction === `delete:${task.id}`} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
      <p role="status" aria-live="polite" className="mt-4 min-h-5 text-xs opacity-70">{status}</p>
    </Card>
  );
}
