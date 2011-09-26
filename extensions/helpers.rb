module Proton::Helpers
  def path_for(path)
    page  = Proton::Page[path]
    fpath = Proton.project.root(page.filepath)
    mtime = File.mtime(fpath).to_i

    [ path, '?', mtime ].join ''
  end
end
