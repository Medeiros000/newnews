import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/ToastContainer';
import { useUserStore, useThemeStore, useToastStore } from '@/stores';
import { userService } from '@/services';
import {
  IconUser,
  IconLock,
  IconPalette,
  IconBookmark,
  IconHistory,
  IconCheck,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { getNewsPath, formatTimeAgo } from '@/utils';

export function SettingsPage() {
  const user = useUserStore((state) => state.user);
  const updateUserProfile = useUserStore((state) => state.updateUserProfile);
  const updateUserPreferences = useUserStore((state) => state.updateUserPreferences);
  const showToast = useToastStore((state) => state.showToastNotification);
  const { theme, setTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(
    user?.preferences?.emailNotifications ?? true,
  );
  const [newsletter, setNewsletter] = useState(
    user?.preferences?.newsletter ?? false,
  );

  // Bookmarks & History
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      if (user.preferences) {
        setEmailNotifications(user.preferences.emailNotifications);
        setNewsletter(user.preferences.newsletter);
      }
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'bookmarks' || activeTab === 'history') {
      loadUserData();
    }
  }, [activeTab]);

  const loadUserData = async () => {
    setIsLoadingLists(true);
    try {
      if (activeTab === 'bookmarks') {
        const res = await userService.getBookmarks();
        if (res.success) setBookmarks(res.data);
      } else if (activeTab === 'history') {
        const res = await userService.getHistory();
        if (res.success) setHistory(res.data);
      }
    } catch {
      showToast('Erro ao carregar dados salvos', 'error');
    } finally {
      setIsLoadingLists(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({ name, bio, avatarUrl });
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch {
      showToast('Falha ao atualizar perfil.', 'error');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('A nova senha e confirmação não conferem.', 'warning');
      return;
    }
    try {
      await userService.updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Senha alterada com sucesso!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao alterar senha.', 'error');
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      await updateUserPreferences({
        theme,
        emailNotifications,
        newsletter,
        favoriteCategories: user?.preferences?.favoriteCategories || [],
      });
      showToast('Preferências salvas!', 'success');
    } catch {
      showToast('Erro ao salvar preferências.', 'error');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-body">
      <Navbar />

      <main className="container-xl py-4 flex-grow-1">
        <header className="mb-4">
          <h1 className="h3 fw-bold mb-1">Configurações & Perfil</h1>
          <p className="text-secondary small">
            Gerencie sua conta, preferências de exibição e artigos salvos.
          </p>
        </header>

        <div className="row g-4">
          <aside className="col-12 col-md-3">
            <div className="list-group rounded-3 shadow-sm border-0">
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeTab === 'profile' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <IconUser size={18} />
                <span>Perfil</span>
              </button>
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeTab === 'security' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('security')}
              >
                <IconLock size={18} />
                <span>Segurança & Senha</span>
              </button>
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeTab === 'preferences' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                <IconPalette size={18} />
                <span>Aparência & Preferências</span>
              </button>
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeTab === 'bookmarks' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('bookmarks')}
              >
                <IconBookmark size={18} />
                <span>Notícias Salvas</span>
              </button>
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeTab === 'history' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('history')}
              >
                <IconHistory size={18} />
                <span>Histórico de Leitura</span>
              </button>
            </div>
          </aside>

          <section className="col-12 col-md-9">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile}>
                  <h2 className="h5 fw-bold mb-3 pb-2 border-bottom">Informações do Perfil</h2>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nome Completo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">E-mail</label>
                    <input
                      type="email"
                      className="form-control bg-secondary-subtle"
                      value={user?.email || ''}
                      disabled
                    />
                    <small className="text-muted">O e-mail não pode ser alterado diretamente.</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Bio / Sobre você</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre seus interesses..."
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold">URL do Avatar</label>
                    <input
                      type="url"
                      className="form-control"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://exemplo.com/minha-foto.jpg"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary rounded-pill px-4">
                    <IconDeviceFloppy size={18} className="me-1" /> Salvar Perfil
                  </button>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handleSavePassword}>
                  <h2 className="h5 fw-bold mb-3 pb-2 border-bottom">Alteração de Senha</h2>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Senha Atual</label>
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nova Senha</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary rounded-pill px-4">
                    Atualizar Senha
                  </button>
                </form>
              )}

              {activeTab === 'preferences' && (
                <form onSubmit={handleSavePreferences}>
                  <h2 className="h5 fw-bold mb-3 pb-2 border-bottom">Tema & Preferências</h2>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold d-block mb-2">Tema da Interface</label>
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setTheme('light')}
                      >
                        Claro
                      </button>
                      <button
                        type="button"
                        className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setTheme('dark')}
                      >
                        Escuro
                      </button>
                      <button
                        type="button"
                        className={`btn ${theme === 'system' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setTheme('system')}
                      >
                        Sistema
                      </button>
                    </div>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="emailNotif"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="emailNotif">
                      Receber notificações de notícias relevantes por e-mail
                    </label>
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="newsletterSwitch"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="newsletterSwitch">
                      Assinar newsletter semanal NewsHub
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary rounded-pill px-4">
                    Salvar Preferências
                  </button>
                </form>
              )}

              {activeTab === 'bookmarks' && (
                <div>
                  <h2 className="h5 fw-bold mb-3 pb-2 border-bottom">Notícias Salvas</h2>
                  {isLoadingLists ? (
                    <div className="text-center py-4">Carregando...</div>
                  ) : bookmarks.length === 0 ? (
                    <p className="text-muted text-center py-4">Nenhuma notícia salva ainda.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {bookmarks.map((b) => (
                        <div key={b.id} className="card p-3 border rounded-3 d-flex flex-row gap-3 align-items-center">
                          <img
                            src={b.news?.imageUrl || b.news?.image_url}
                            alt=""
                            className="rounded-3 object-fit-cover"
                            style={{ width: 80, height: 60 }}
                          />
                          <div className="flex-grow-1">
                            <Link to={getNewsPath(b.news)} className="fw-semibold text-decoration-none text-body">
                              {b.news?.title}
                            </Link>
                            <div className="small text-muted mt-1">Salvo em {new Date(b.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h2 className="h5 fw-bold mb-3 pb-2 border-bottom">Histórico de Leitura Recente</h2>
                  {isLoadingLists ? (
                    <div className="text-center py-4">Carregando...</div>
                  ) : history.length === 0 ? (
                    <p className="text-muted text-center py-4">Histórico vazio.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {history.map((h) => (
                        <div key={h.id} className="card p-3 border rounded-3 d-flex flex-row gap-3 align-items-center">
                          <div className="flex-grow-1">
                            <Link to={getNewsPath(h.news)} className="fw-semibold text-decoration-none text-body">
                              {h.news?.title}
                            </Link>
                            <div className="small text-muted mt-1">Lido {formatTimeAgo(h.viewedAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
