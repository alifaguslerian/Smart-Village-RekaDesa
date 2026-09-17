import React from 'react';

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <main role="alert" className="min-h-screen bg-[#fdfcf8] flex flex-col items-center justify-center gap-3 p-6 text-stone-800">
        <p>Tampilan belum dapat dimuat.</p>
        <button onClick={() => window.location.reload()} className="font-bold text-teal-800 underline">Coba lagi</button>
      </main>;
    }
    return this.props.children;
  }
}
